import {
  useEffect,
  useRef,
  useState,
} from "react";
import {adminScrapingApi} from "@/features/admin/adminScrapingApi.ts";
import {TranslationIssuesModal} from "@/features/admin/TranslationIssuesModal.tsx";

type SiteKey = "sklep_wina" | "winapl" | "malawinnica";

type StepKey =
  | "list"
  | "fetch"
  | "reconcile"
  | "persist";

type StepStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "partial"
  | "failed"
  | "cancelled";

type RunSummary = {
  run_id: number;
  run_key: string;
  site: SiteKey;
  status: string;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  duration_seconds: number | null;
};

type StepSummary = {
  id: number;
  run_id: number;
  step_key: StepKey;
  status: StepStatus;
  started_at: string | null;
  finished_at: string | null;
  duration_seconds: number | null;
  fetched_count: number;
  changed_count: number;
  retries: number;
  input_blob_path: string | null;
  output_blob_path: string | null;
  error_message: string | null;
};

type SiteState = {
  expanded: boolean;
  lastRun: RunSummary | null;
  steps: Partial<Record<StepKey, StepSummary>>;
  logs: string[];
  isRunningList: boolean;
  isRunningFetch: boolean;
  isRunningPersist: boolean;
};

const initialSiteState: Record<SiteKey, SiteState> = {
  sklep_wina: {
    expanded: false,
    lastRun: null,
    steps: {},
    logs: [],
    isRunningList: false,
    isRunningFetch: false,
    isRunningPersist: false,
  },
  winapl: {
    expanded: false,
    lastRun: null,
    steps: {},
    logs: [],
    isRunningList: false,
    isRunningFetch: false,
    isRunningPersist: false,
  },
  malawinnica: {
    expanded: false,
    lastRun: null,
    steps: {},
    logs: [],
    isRunningList: false,
    isRunningFetch: false,
    isRunningPersist: false,
  },
};

const SITE_META: Record<SiteKey, { label: string }> = {
  sklep_wina: { label: "Sklep Wina" },
  winapl: { label: "Wina.pl" },
  malawinnica: { label: "Mala Winnica" },
};


function formatRunTime(run: RunSummary) {
  const date =
    run.finished_at ??
    run.started_at ??
    run.created_at;

  return new Date(date).toLocaleString();
}

function isTerminalStepStatus(
  status: StepStatus,
): boolean {
  return [
    "succeeded",
    "partial",
    "failed",
    "cancelled",
  ].includes(status);
}

function formatDuration(
  durationSeconds: number | null,
): string {
  if (durationSeconds === null) {
    return "unknown";
  }

  return `${durationSeconds.toFixed(1)}s`;
}

export function AdminScrapingPage() {
  const [sites, setSites] = useState(initialSiteState);
  const [error, setError] = useState<string | null>(null);

  const activePollsRef = useRef(
    new Set<string>(),
  );

  const pollTimersRef = useRef(
    new Set<number>(),
  );

  const [translationReviewRun, setTranslationReviewRun] =
    useState<{
      runId: number;
      siteName: string;
    } | null>(null);

  const [isReconcilingTranslations, setIsReconcilingTranslations] =
  useState<Record<SiteKey, boolean>>({
    sklep_wina: false,
    winapl: false,
    malawinnica: false,
  });


  async function reconcileTranslations(
    site: SiteKey,
  ) {
    const run = sites[site].lastRun;

    if (!run) {
      setError(
        "Cannot reconcile translations: no scrape run exists.",
      );
      return;
    }

    setError(null);

    setIsReconcilingTranslations((prev) => ({
      ...prev,
      [site]: true,
    }));

    setSites((prev) => ({
      ...prev,
      [site]: {
        ...prev[site],
        logs: [
          ...prev[site].logs,
          `[${new Date().toLocaleTimeString()}] ` +
            "Queuing translation reconciliation...",
        ],
      },
    }));

    try {
      const result =
        await adminScrapingApi.reconcileTranslations(
          run.run_id,
        );

      setSites((prev) => ({
        ...prev,
        [site]: {
          ...prev[site],
          logs: [
            ...prev[site].logs,
            `[${new Date().toLocaleTimeString()}] ` +
              `Translation reconciliation queued. ` +
              `mode=${result.mode}, ` +
              `resolved=${result.resolved_occurrence_count}, ` +
              `ignored=${result.ignored_occurrence_count}.`,
          ],
        },
      }));
      void pollTranslationReconciliation(
        site,
        result.source_run_id,
        run.run_key,
      );
    } catch (e: any) {
      const message =
        e.message ??
        "Failed to start translation reconciliation";

      setError(message);

      setIsReconcilingTranslations((prev) => ({
        ...prev,
        [site]: false,
      }));

      setSites((prev) => ({
        ...prev,
        [site]: {
          ...prev[site],
          logs: [
            ...prev[site].logs,
            `[${new Date().toLocaleTimeString()}] ` +
              `ERROR: ${message}`,
          ],
        },
      }));
    }
  }

  function beginPolling(
    runId: number,
    stepKey: StepKey,
  ): boolean {
    const key = `${runId}:${stepKey}`;

    if (activePollsRef.current.has(key)) {
      return false;
    }

    activePollsRef.current.add(key);

    return true;
  }

  function stopPolling(
    runId: number,
    stepKey: StepKey,
  ) {
    const key = `${runId}:${stepKey}`;

    activePollsRef.current.delete(key);
  }

  function schedulePoll(
    callback: () => void,
    delay: number,
  ) {
    const timerId = window.setTimeout(() => {
      pollTimersRef.current.delete(timerId);
      callback();
    }, delay);

    pollTimersRef.current.add(timerId);
  }

  function openTranslationIssues(
    runId: number,
    siteName: string,
  ) {
    setTranslationReviewRun({
      runId,
      siteName,
    });
  }
  async function pollTranslationReconciliation(
    site: SiteKey,
    runId: number,
    runKey: string,
  ) {
    const interval = 5_000;
    const timeout = 10 * 60 * 1000;
    const startedPollingAt = Date.now();

    async function tick() {
      try {
        const [run, steps] = await Promise.all([
          adminScrapingApi.getRun(runId),
          adminScrapingApi.getSteps(runId),
        ]);

        const listStep = steps.find(
          (step) => step.step_key === "list",
        );

        const fetchStep = steps.find(
          (step) => step.step_key === "fetch",
        );

        const reconcileStep = steps.find(
          (step) => step.step_key === "reconcile",
        );

        const persistStep = steps.find(
          (step) => step.step_key === "persist",
        );

        setSites((prev) => ({
          ...prev,
          [site]: {
            ...prev[site],
            lastRun: {
              run_id: run.id,
              run_key: run.run_key,
              site,
              status: run.status,
              created_at: run.created_at,
              started_at: run.started_at,
              finished_at: run.finished_at,
              duration_seconds: run.duration_seconds,
            },
            steps: {
              ...prev[site].steps,
              ...(listStep ? {list: listStep} : {}),
              ...(fetchStep ? {fetch: fetchStep} : {}),
              ...(persistStep ? {persist: persistStep} : {}),
            },
          },
        }));

        if (!reconcileStep) {
          if (Date.now() - startedPollingAt < timeout) {
            window.setTimeout(tick, interval);
            return;
          }

          throw new Error(
            "Timed out waiting for reconciliation step to start.",
          );
        }

        if (isTerminalStepStatus(reconcileStep.status)) {
          const logs = await adminScrapingApi.getLogs(
            runId,
          );

          setIsReconcilingTranslations((prev) => ({
            ...prev,
            [site]: false,
          }));

          setSites((prev) => ({
            ...prev,
            [site]: {
              ...prev[site],
              logs: [
                ...prev[site].logs,
                `[${new Date().toLocaleTimeString()}] ` +
                  `Translation reconciliation ` +
                  `${reconcileStep.status}. ` +
                  `re-fetched=${reconcileStep.fetched_count}, ` +
                  `merged=${reconcileStep.changed_count}.`,
                ...logs.map(
                  (log) =>
                    `[${new Date(
                      log.timestamp,
                    ).toLocaleTimeString()}] ` +
                    `(${log.level}) ${log.message}`,
                ),
              ],
            },
          }));

          return;
        }

        if (Date.now() - startedPollingAt < timeout) {
          window.setTimeout(tick, interval);
          return;
        }

        throw new Error(
          `Translation reconciliation timed out for ${runKey}.`,
        );
      } catch (e: any) {
        const message =
          e.message ??
          "Unknown translation reconciliation polling error";

        setIsReconcilingTranslations((prev) => ({
          ...prev,
          [site]: false,
        }));

        setSites((prev) => ({
          ...prev,
          [site]: {
            ...prev[site],
            logs: [
              ...prev[site].logs,
              `[${new Date().toLocaleTimeString()}] ` +
                `ERROR while polling translation reconciliation: ` +
                `${message}`,
            ],
          },
        }));
      }
    }

    void tick();
  }

  async function pollListStep(
    site: SiteKey,
    runId: number,
    runKey: string,
  ) {
    const didStartPolling = beginPolling(
      runId,
      "list",
    );

    if (!didStartPolling) {
      return;
    }
    const interval = 3000;
    const timeout = 5 * 60 * 1000;
    const startedPollingAt = Date.now();

    async function tick() {
      try {
        const [run, steps] = await Promise.all([
          adminScrapingApi.getRun(runId),
          adminScrapingApi.getSteps(runId),
        ]);

        const listStep = steps.find(
          (step) => step.step_key === "list",
        );

        setSites((prev) => ({
          ...prev,
          [site]: {
            ...prev[site],
            lastRun: {
              run_id: run.id,
              run_key: run.run_key,
              site,
              status: run.status,
              created_at: run.created_at,
              started_at: run.started_at,
              finished_at: run.finished_at,
              duration_seconds: run.duration_seconds,
            },
            steps: {
              ...prev[site].steps,
              ...(listStep ? {list: listStep} : {}),
            },
          },
        }));

        const runEndedBeforeListStarted =
          ["failed", "cancelled"].includes(run.status) &&
          !listStep;

        if (
          listStep &&
          isTerminalStepStatus(listStep.status)
        ) {
          stopPolling(runId, "list");
          const logs = await adminScrapingApi.getLogs(
            runId,
          );

          setSites((prev) => ({
            ...prev,
            [site]: {
              ...prev[site],
              isRunningList: false,
              logs: [
                ...prev[site].logs,
                `[${new Date().toLocaleTimeString()}] ` +
                  `List step ${listStep.status}. ` +
                  `links=${listStep.fetched_count}, ` +
                  `duration=${formatDuration(
                    listStep.duration_seconds,
                  )}.`,
                ...logs.map(
                  (log) =>
                    `[${new Date(
                      log.timestamp,
                    ).toLocaleTimeString()}] ` +
                    `(${log.level}) ${log.message}`,
                ),
              ],
            },
          }));

          return;
        }

        if (runEndedBeforeListStarted) {
          const logs = await adminScrapingApi.getLogs(
            runId,
          );

          setSites((prev) => ({
            ...prev,
            [site]: {
              ...prev[site],
              isRunningList: false,
              logs: [
                ...prev[site].logs,
                `[${new Date().toLocaleTimeString()}] ` +
                  `Run ${runKey} ended before the list step started.`,
                ...logs.map(
                  (log) =>
                    `[${new Date(
                      log.timestamp,
                    ).toLocaleTimeString()}] ` +
                    `(${log.level}) ${log.message}`,
                ),
              ],
            },
          }));

          return;
        }

        if (Date.now() - startedPollingAt < timeout) {
          schedulePoll(tick, interval);
          return;
        }

        setSites((prev) => ({
          ...prev,
          [site]: {
            ...prev[site],
            isRunningList: false,
            logs: [
              ...prev[site].logs,
              `[${new Date().toLocaleTimeString()}] ` +
                `Polling timed out for list step in run ${runKey}.`,
            ],
          },
        }));
      } catch (e: any) {
        const message =
          e.message ?? "Unknown polling error";

        setSites((prev) => ({
          ...prev,
          [site]: {
            ...prev[site],
            isRunningList: false,
            logs: [
              ...prev[site].logs,
              `[${new Date().toLocaleTimeString()}] ` +
                `ERROR while polling list step for run ` +
                `${runKey}: ${message}`,
            ],
          },
        }));
      }
    }

    void tick();
  }

  useEffect(() => {
    let cancelled = false;

    async function loadLastRuns() {
      try {
        const results = await Promise.all(
          (Object.keys(SITE_META) as SiteKey[]).map(
            async (site) => {
              const runs = await adminScrapingApi.listRuns(
                site,
                1,
              );

              const run = runs[0] ?? null;

              if (!run) {
                return {
                  site,
                  run: null,
                  steps: [],
                };
              }

              const steps = await adminScrapingApi.getSteps(
                run.id,
              );

              return {
                site,
                run,
                steps,
              };
            },
          ),
        );

        if (cancelled) {
          return;
        }

        setSites((prev) => {
          const next = {...prev};

          for (const {site, run, steps} of results) {
            if (!run) {
              continue;
            }

            const stepMap = Object.fromEntries(
              steps.map((step) => [
                step.step_key,
                step,
              ]),
            ) as Partial<
              Record<StepKey, StepSummary>
            >;

            next[site] = {
              ...next[site],
              lastRun: {
                run_id: run.id,
                run_key: run.run_key,
                site,
                status: run.status,
                created_at: run.created_at,
                started_at: run.started_at,
                finished_at: run.finished_at,
                duration_seconds: run.duration_seconds,
              },
              steps: stepMap,
              isRunningList:
                stepMap.list?.status === "queued" ||
                stepMap.list?.status === "running",
              isRunningFetch:
                stepMap.fetch?.status === "queued" ||
                stepMap.fetch?.status === "running",
              isRunningPersist:
                stepMap.persist?.status === "queued" ||
                stepMap.persist?.status === "running",
            };
          }

          return next;
        });

        for (const {site, run, steps} of results) {
          if (!run) {
            continue;
          }

          const listStep = steps.find(
            (step) => step.step_key === "list",
          );

          if (
            listStep &&
            (listStep.status === "queued" ||
              listStep.status === "running")
          ) {
            void pollListStep(
              site,
              run.id,
              run.run_key,
            );
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(
            e.message ??
              "Failed to load recent scraping runs",
          );
        }
      }
    }

    void loadLastRuns();

    return () => {
      cancelled = true;

      for (const timerId of pollTimersRef.current) {
        window.clearTimeout(timerId);
      }

      pollTimersRef.current.clear();
      activePollsRef.current.clear();
    };
  }, []);

  async function pollFetchStep(
    site: SiteKey,
    runId: number,
    runKey: string,
  ) {
    const didStartPolling = beginPolling(
      runId,
      "fetch",
    );

    if (!didStartPolling) {
      return;
    }

    const interval = 10_000;
    const timeout = 30 * 60 * 1000;
    const startedPollingAt = Date.now();


    async function tick() {
      try {
        const [run, steps] = await Promise.all([
          adminScrapingApi.getRun(runId),
          adminScrapingApi.getSteps(runId),
        ]);

        const fetchStep = steps.find(
          (step) => step.step_key === "fetch",
        );
        if (
          fetchStep &&
          (fetchStep.status === "queued" ||
            fetchStep.status === "running")
        ) {
          void pollFetchStep(
            site,
            run.id,
            run.run_key,
          );
        }

        setSites((prev) => ({
          ...prev,
          [site]: {
            ...prev[site],
            lastRun: {
              run_id: run.id,
              run_key: run.run_key,
              site,
              status: run.status,
              created_at: run.created_at,
              started_at: run.started_at,
              finished_at: run.finished_at,
              duration_seconds: run.duration_seconds,
            },
            steps: {
              ...prev[site].steps,
              ...(fetchStep ? {fetch: fetchStep} : {}),
            },
          },
        }));

        if (
          fetchStep &&
          isTerminalStepStatus(fetchStep.status)
        ) {
          stopPolling(runId, "fetch");

          const logs = await adminScrapingApi.getLogs(
            runId,
          );

          setSites((prev) => ({
            ...prev,
            [site]: {
              ...prev[site],
              isRunningFetch: false,
              logs: [
                ...prev[site].logs,
                `[${new Date().toLocaleTimeString()}] ` +
                  `Fetch step ${fetchStep.status}. ` +
                  `processed=${fetchStep.fetched_count}, ` +
                  `duration=${formatDuration(
                    fetchStep.duration_seconds,
                  )}.`,
                ...logs.map(
                  (log) =>
                    `[${new Date(
                      log.timestamp,
                    ).toLocaleTimeString()}] ` +
                    `(${log.level}) ${log.message}`,
                ),
              ],
            },
          }));

          return;
        }

        if (Date.now() - startedPollingAt < timeout) {
          window.setTimeout(tick, interval);
          return;
        }

        setSites((prev) => ({
          ...prev,
          [site]: {
            ...prev[site],
            isRunningFetch: false,
            logs: [
              ...prev[site].logs,
              `[${new Date().toLocaleTimeString()}] ` +
                `Polling timed out for fetch step in run ${runKey}.`,
            ],
          },
        }));
      } catch (e: any) {
        const message =
          e.message ?? "Unknown fetch polling error";

        setSites((prev) => ({
          ...prev,
          [site]: {
            ...prev[site],
            isRunningFetch: false,
            logs: [
              ...prev[site].logs,
              `[${new Date().toLocaleTimeString()}] ` +
                `ERROR while polling fetch step for run ` +
                `${runKey}: ${message}`,
            ],
          },
        }));
      }
    }

    void tick();
  }

  async function pollPersistStep(
    site: SiteKey,
    runId: number,
    runKey: string,
  ) {
    const didStartPolling = beginPolling(
       runId,
       "persist",
     );

     if (!didStartPolling) {
       return;
     }
    const interval = 10_000;
    const timeout = 30 * 60 * 1000;
    const startedPollingAt = Date.now();

    async function tick() {
      try {
        const [run, steps] = await Promise.all([
          adminScrapingApi.getRun(runId),
          adminScrapingApi.getSteps(runId),
        ]);

        const persistStep = steps.find(
          (step) => step.step_key === "persist",
        );

        if (
          persistStep &&
          (persistStep.status === "queued" ||
            persistStep.status === "running")
        ) {
          void pollPersistStep(
            site,
            run.id,
            run.run_key,
          );
        }

        setSites((prev) => ({
          ...prev,
          [site]: {
            ...prev[site],
            lastRun: {
              run_id: run.id,
              run_key: run.run_key,
              site,
              status: run.status,
              created_at: run.created_at,
              started_at: run.started_at,
              finished_at: run.finished_at,
              duration_seconds: run.duration_seconds,
            },
            steps: {
              ...prev[site].steps,
              ...(persistStep
                ? {persist: persistStep}
                : {}),
            },
          },
        }));

        if (
          persistStep &&
          isTerminalStepStatus(persistStep.status)
        ) {
          stopPolling(runId, "persist");
          const logs = await adminScrapingApi.getLogs(
            runId,
          );

          setSites((prev) => ({
            ...prev,
            [site]: {
              ...prev[site],
              isRunningPersist: false,
              logs: [
                ...prev[site].logs,
                `[${new Date().toLocaleTimeString()}] ` +
                  `Persist step ${persistStep.status}. ` +
                  `rows=${persistStep.fetched_count}, ` +
                  `changed=${persistStep.changed_count}, ` +
                  `duration=${formatDuration(
                    persistStep.duration_seconds,
                  )}.`,
                ...logs.map(
                  (log) =>
                    `[${new Date(
                      log.timestamp,
                    ).toLocaleTimeString()}] ` +
                    `(${log.level}) ${log.message}`,
                ),
              ],
            },
          }));

          return;
        }

        if (Date.now() - startedPollingAt < timeout) {
          window.setTimeout(tick, interval);
          return;
        }

        setSites((prev) => ({
          ...prev,
          [site]: {
            ...prev[site],
            isRunningPersist: false,
            logs: [
              ...prev[site].logs,
              `[${new Date().toLocaleTimeString()}] ` +
                `Polling timed out for persist step in run ` +
                `${runKey}.`,
            ],
          },
        }));
      } catch (e: any) {
        const message =
          e.message ?? "Unknown persist polling error";

        setSites((prev) => ({
          ...prev,
          [site]: {
            ...prev[site],
            isRunningPersist: false,
            logs: [
              ...prev[site].logs,
              `[${new Date().toLocaleTimeString()}] ` +
                `ERROR while polling persist step for run ` +
                `${runKey}: ${message}`,
            ],
          },
        }));
      }
    }

    void tick();
  }

  async function startList(site: SiteKey) {
    setError(null);

    setSites((prev) => ({
      ...prev,
      [site]: {
        ...prev[site],
        isRunningList: true,
        isRunningFetch: false,
        isRunningPersist: false,
        logs: [
          `[${new Date().toLocaleTimeString()}] ` +
            "Queuing list step...",
        ],
      },
    }));

    try {
      const data = await adminScrapingApi.startList(site);

      setSites((prev) => ({
        ...prev,
        [site]: {
          ...prev[site],
          lastRun: {
            run_id: data.run_id,
            run_key: data.run_key,
            site,
            status: data.status,
            created_at: new Date().toISOString(),
            started_at: null,
            finished_at: null,
            duration_seconds: null,
          },
          steps: {
            list: {
              id: 0,
              run_id: data.run_id,
              step_key: "list",
              status: "queued",
              started_at: null,
              finished_at: null,
              duration_seconds: null,
              fetched_count: 0,
              changed_count: 0,
              retries: 0,
              input_blob_path: null,
              output_blob_path: null,
              error_message: null,
            },
          },
          logs: [
            ...prev[site].logs,
            `[${new Date().toLocaleTimeString()}] ` +
              `Run ${data.run_key} queued.`,
          ],
        },
      }));

      void pollListStep(
        site,
        data.run_id,
        data.run_key,
      );
    } catch (e: any) {
      const message =
        e.message ?? "Failed to start list step";

      setError(message);

      setSites((prev) => ({
        ...prev,
        [site]: {
          ...prev[site],
          isRunningList: false,
          logs: [
            ...prev[site].logs,
            `[${new Date().toLocaleTimeString()}] ` +
              `ERROR: ${message}`,
          ],
        },
      }));
    }
  }

  async function startFetch(site: SiteKey) {
    const state = sites[site];
    const run = state.lastRun;
    const listStep = state.steps.list;

    if (!run || listStep?.status !== "succeeded") {
      setError(
        "Fetch can start only after the list step succeeds.",
      );
      return;
    }

    if (state.steps.fetch) {
      setError(
        "This run already has a fetch step. Start a new list run first.",
      );
      return;
    }

    setError(null);

    setSites((prev) => ({
      ...prev,
      [site]: {
        ...prev[site],
        isRunningFetch: true,
        steps: {
          ...prev[site].steps,
          fetch: {
            id: 0,
            run_id: run.run_id,
            step_key: "fetch",
            status: "queued",
            started_at: null,
            finished_at: null,
            duration_seconds: null,
            fetched_count: 0,
            changed_count: 0,
            retries: 0,
            input_blob_path: listStep.output_blob_path,
            output_blob_path: null,
            error_message: null,
          },
        },
        logs: [
          ...prev[site].logs,
          `[${new Date().toLocaleTimeString()}] ` +
            "Queuing fetch step...",
        ],
      },
    }));

    try {
      const data = await adminScrapingApi.startFetch(
        run.run_id,
      );

      void pollFetchStep(
        site,
        data.run_id,
        data.run_key,
      );
    } catch (e: any) {
      const message =
        e.message ?? "Failed to start fetch step";

      setError(message);

      setSites((prev) => ({
        ...prev,
        [site]: {
          ...prev[site],
          isRunningFetch: false,
          steps: {
            ...prev[site].steps,
            fetch: undefined,
          },
          logs: [
            ...prev[site].logs,
            `[${new Date().toLocaleTimeString()}] ` +
              `ERROR: ${message}`,
          ],
        },
      }));
    }
  }

  async function startPersist(site: SiteKey) {
    const state = sites[site];
    const run = state.lastRun;
    const fetchStep = state.steps.fetch;

    if (
      !run ||
      !fetchStep ||
      !["succeeded", "partial"].includes(
        fetchStep.status,
      )
    ) {
      setError(
        "Persist can start only after fetch succeeds or completes partially.",
      );
      return;
    }

    if (state.steps.persist) {
      setError(
        "This run already has a persist step. Start a new list run first.",
      );
      return;
    }

    setError(null);

    setSites((prev) => ({
      ...prev,
      [site]: {
        ...prev[site],
        isRunningPersist: true,
        steps: {
          ...prev[site].steps,
          persist: {
            id: 0,
            run_id: run.run_id,
            step_key: "persist",
            status: "queued",
            started_at: null,
            finished_at: null,
            duration_seconds: null,
            fetched_count: 0,
            changed_count: 0,
            retries: 0,
            input_blob_path: fetchStep.output_blob_path,
            output_blob_path: null,
            error_message: null,
          },
        },
        logs: [
          ...prev[site].logs,
          `[${new Date().toLocaleTimeString()}] ` +
            "Queuing persist step...",
        ],
      },
    }));

    try {
      const data = await adminScrapingApi.startPersist(
        run.run_id,
      );

      void pollPersistStep(
        site,
        data.run_id,
        data.run_key,
      );
    } catch (e: any) {
      const message =
        e.message ?? "Failed to start persist step";

      setError(message);

      setSites((prev) => ({
        ...prev,
        [site]: {
          ...prev[site],
          isRunningPersist: false,
          steps: {
            ...prev[site].steps,
            persist: undefined,
          },
          logs: [
            ...prev[site].logs,
            `[${new Date().toLocaleTimeString()}] ` +
              `ERROR: ${message}`,
          ],
        },
      }));
    }
  }


  function toggleExpanded(site: SiteKey) {
    setSites((prev) => ({
      ...prev,
      [site]: {
        ...prev[site],
        expanded: !prev[site].expanded,
      },
    }));
  }

  return (
    <div className="w-full">
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-100">
        Web scraping control panel
      </h2>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/60 bg-red-950/60 px-4 py-3 text-sm font-medium text-red-200">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {(Object.keys(SITE_META) as SiteKey[]).map((site) => {
          const state = sites[site];
          const meta = SITE_META[site];
          const listStep = state.steps.list;

          const listStatusClass =
            listStep?.status === "succeeded"
              ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-300"
              : listStep?.status === "failed" ||
                  listStep?.status === "cancelled"
                ? "border-red-500/50 bg-red-950/30 text-red-300"
                : listStep?.status === "partial"
                  ? "border-amber-500/50 bg-amber-950/30 text-amber-300"
                  : listStep?.status === "running"
                    ? "border-sky-500/50 bg-sky-950/30 text-sky-300"
                    : "border-slate-600 bg-slate-800 text-slate-300";

          const fetchStep = state.steps.fetch;

          const canStartFetch =
            listStep?.status === "succeeded" &&
            !fetchStep &&
            !state.isRunningFetch;

          const persistStep = state.steps.persist;

          const canStartPersist =
            ["succeeded", "partial"].includes(
              fetchStep?.status ?? "",
            ) &&
            !persistStep &&
            !state.isRunningPersist;
          return (
            <div
              key={site}
              className="rounded-2xl border border-slate-700 bg-slate-900/70 shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggleExpanded(site)}
                className="flex w-full items-center justify-between border-b border-slate-800 px-4 py-3 text-left"
              >
                <div>
                  <span className="text-sm font-semibold text-slate-100">
                    {meta.label}
                  </span>
                  {state.lastRun && (
                    <span className="ml-2 text-xs text-slate-400">
                      Last run: {formatRunTime(state.lastRun)} · {state.lastRun.status}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {state.expanded ? "Hide stages" : "Show stages"}
                </span>
              </button>

              {state.expanded && (
                <div className="space-y-4 px-4 py-3 text-sm text-slate-100">
                  {state.lastRun && (
                    <div className="rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-medium text-slate-300">
                          Pipeline run
                        </span>

                        <span className="text-xs text-slate-400">
                          {state.lastRun.run_key}
                        </span>
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        Status: {state.lastRun.status} · Started:{" "}
                        {state.lastRun.started_at
                          ? new Date(
                              state.lastRun.started_at,
                            ).toLocaleString()
                          : "not started"}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="mb-2 text-xs font-medium text-slate-400">
                      Stages
                    </div>

                    <div className="grid gap-3 lg:grid-cols-3">
                      <div
                        className={`rounded-xl border px-3 py-3 ${listStatusClass}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold">
                            1. List links
                          </span>

                          <span className="text-xs capitalize">
                            {listStep?.status ?? "not started"}
                          </span>
                        </div>

                        <div className="mt-2 text-xs opacity-80">
                          Discover retailer product URLs and save
                          them to Azure Blob Storage.
                        </div>

                        {listStep && (
                          <div className="mt-2 space-y-1 text-xs opacity-90">
                            <div>
                              Links found:{" "}
                              {listStep.fetched_count}
                            </div>

                            <div>
                              Duration:{" "}
                              {formatDuration(
                                listStep.duration_seconds,
                              )}
                            </div>

                            {listStep.retries > 0 && (
                              <div>
                                Retries: {listStep.retries}
                              </div>
                            )}
                          </div>
                        )}

                        {listStep?.error_message && (
                          <div className="mt-2 text-xs text-red-200">
                            {listStep.error_message}
                          </div>
                        )}

                        {listStep?.output_blob_path && (
                          <div
                            className="mt-2 break-all text-xs opacity-70"
                            title={listStep.output_blob_path}
                          >
                            Blob: {listStep.output_blob_path}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => startList(site)}
                          disabled={state.isRunningList}
                          className="mt-3 inline-flex items-center rounded-xl border border-teal-500/70 bg-teal-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {state.isRunningList
                            ? "Running list step..."
                            : listStep?.status === "succeeded"
                              ? "Run list again"
                              : "Start list"}
                        </button>
                      </div>

                      <div
                        className={`rounded-xl border px-3 py-3 ${
                          fetchStep?.status === "succeeded"
                            ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-300"
                            : fetchStep?.status === "failed" ||
                                fetchStep?.status === "cancelled"
                              ? "border-red-500/50 bg-red-950/30 text-red-300"
                              : fetchStep?.status === "partial"
                                ? "border-amber-500/50 bg-amber-950/30 text-amber-300"
                                : fetchStep?.status === "running"
                                  ? "border-sky-500/50 bg-sky-950/30 text-sky-300"
                                  : "border-slate-700 bg-slate-950/50 text-slate-500"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold">
                            2. Fetch details
                          </span>

                          <span className="text-xs capitalize">
                            {fetchStep?.status ?? "not started"}
                          </span>
                        </div>

                        <div className="mt-2 text-xs">
                          Read the links Blob, fetch each product
                          page, normalize details, and create the
                          product CSV.
                        </div>

                        {fetchStep && (
                           <div className="mt-2 space-y-1 text-xs opacity-90">
                             <div>
                               Progress: {fetchStep.fetched_count} /{" "}
                               {listStep?.fetched_count ?? 0}
                             </div>

                             <div>
                               Duration:{" "}
                               {formatDuration(
                                 fetchStep.duration_seconds,
                               )}
                             </div>

                             {fetchStep.retries > 0 && (
                               <div>
                                 Retries: {fetchStep.retries}
                               </div>
                             )}
                           </div>
                         )}

                         {fetchStep?.error_message && (
                           <div className="mt-2 text-xs text-red-200">
                             {fetchStep.error_message}
                           </div>
                         )}

                         {fetchStep?.output_blob_path && (
                           <div
                             className="mt-2 break-all text-xs opacity-70"
                             title={fetchStep.output_blob_path}
                           >
                             Blob: {fetchStep.output_blob_path}
                           </div>
                         )}

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startFetch(site)}
                            disabled={!canStartFetch}
                            className="inline-flex items-center rounded-xl border border-teal-500/70 bg-teal-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-500 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500"
                          >
                            {state.isRunningFetch
                              ? "Running fetch step..."
                              : fetchStep
                                ? "Fetch already run"
                                : listStep?.status !== "succeeded"
                                  ? "Complete list first"
                                  : "Start fetch"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (!state.lastRun) {
                                return;
                              }

                              openTranslationIssues(
                                state.lastRun.run_id,
                                meta.label,
                              );
                            }}
                            disabled={
                              !state.lastRun ||
                              fetchStep?.status !== "partial" ||
                              state.isRunningFetch
                            }
                            className="inline-flex items-center rounded-xl border border-amber-500/60 bg-amber-950/30 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-900/40 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500"
                          >
                            Review issues
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              void reconcileTranslations(site);
                            }}
                            disabled={
                              !state.lastRun ||
                              fetchStep?.status !== "partial" ||
                              state.isRunningFetch ||
                              isReconcilingTranslations[site]
                            }
                            className="inline-flex items-center rounded-xl border border-sky-500/60 bg-sky-950/30 px-3 py-2 text-xs font-semibold text-sky-200 hover:bg-sky-900/40 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500"
                          >
                            {isReconcilingTranslations[site]
                              ? "Re-fetching issues..."
                              : "Re-fetch resolved issues"}
                          </button>
                        </div>
                      </div>

                      <div
                       className={`rounded-xl border px-3 py-3 ${
                         persistStep?.status === "succeeded"
                           ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-300"
                           : persistStep?.status === "failed" ||
                               persistStep?.status === "cancelled"
                             ? "border-red-500/50 bg-red-950/30 text-red-300"
                             : persistStep?.status === "partial"
                               ? "border-amber-500/50 bg-amber-950/30 text-amber-300"
                               : persistStep?.status === "running"
                                 ? "border-sky-500/50 bg-sky-950/30 text-sky-300"
                                 : "border-slate-700 bg-slate-950/50 text-slate-500"
                       }`}
>
                       <div className="flex items-center justify-between gap-3">
                         <span className="text-xs font-semibold">
                           3. Persist records
                         </span>

                         <span className="text-xs capitalize">
                           {persistStep?.status ?? "not started"}
                         </span>
                       </div>

                       <div className="mt-2 text-xs opacity-80">
                         Read the normalized product CSV and create or update
                         wines, retailer offers, prices, and availability.
                       </div>

                        {persistStep && (
                           <div className="mt-2 space-y-1 text-xs opacity-90">
                             <div>
                               CSV rows processed: {persistStep.fetched_count}
                             </div>

                             <div>
                               Product offers changed: {persistStep.changed_count}
                             </div>

                             <div>
                               Duration:{" "}
                               {formatDuration(
                                 persistStep.duration_seconds,
                               )}
                             </div>
                           </div>
                         )}

                         {persistStep?.error_message && (
                           <div className="mt-2 text-xs text-red-200">
                             {persistStep.error_message}
                           </div>
                         )}

                         {persistStep?.input_blob_path && (
                           <div
                             className="mt-2 break-all text-xs opacity-70"
                             title={persistStep.input_blob_path}
                           >
                             Input: {persistStep.input_blob_path}
                           </div>
                         )}

                        <button
                          type="button"
                          onClick={() => startPersist(site)}
                          disabled={!canStartPersist}
                          className="mt-3 inline-flex items-center rounded-xl border border-teal-500/70 bg-teal-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-500 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500"
                        >
                          {state.isRunningPersist
                            ? "Running persist step..."
                            : persistStep
                              ? "Persist already run"
                              : !fetchStep
                                ? "Complete fetch first"
                                : !["succeeded", "partial"].includes(
                                      fetchStep.status,
                                    )
                                  ? "Complete fetch first"
                                  : "Start persist"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-xs font-medium text-slate-400">
                      Logs
                    </div>

                    <div className="max-h-60 overflow-auto rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100">
                      {state.logs.length === 0 ? (
                        <div className="text-slate-500">
                          No logs yet for this site.
                        </div>
                      ) : (
                        state.logs.map((line, index) => (
                          <div key={index}>{line}</div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <TranslationIssuesModal
        open={Boolean(translationReviewRun)}
        runId={translationReviewRun?.runId ?? null}
        siteName={translationReviewRun?.siteName ?? ""}
        onClose={() => {
          setTranslationReviewRun(null);
        }}
      />
    </div>
  );
}