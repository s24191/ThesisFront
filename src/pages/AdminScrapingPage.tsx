import { useState } from "react";
import {adminScrapingApi} from "@/features/admin/adminScrapingApi.ts";

type SiteKey = "sklep_wina" | "winapl" | "malawinnica";

type RunSummary = {
  run_id: number;
  run_key: string;
  site: string;
  status: string;
};

type SiteState = {
  expanded: boolean;
  lastRun: RunSummary | null;
  logs: string[];
  isRunningList: boolean;
};

const initialSiteState: Record<SiteKey, SiteState> = {
  sklep_wina: {
    expanded: false,
    lastRun: null,
    logs: [],
    isRunningList: false,
  },
  winapl: {
    expanded: false,
    lastRun: null,
    logs: [],
    isRunningList: false,
  },
  malawinnica: {
    expanded: false,
    lastRun: null,
    logs: [],
    isRunningList: false,
  },
};

const SITE_META: Record<SiteKey, { label: string }> = {
  sklep_wina: { label: "Sklep Wina" },
  winapl: { label: "Wina.pl" },
  malawinnica: { label: "Mala Winnica" },
};

export function AdminScrapingPage() {
  const [sites, setSites] = useState(initialSiteState);
  const [error, setError] = useState<string | null>(null);

  async function pollRun(site: SiteKey, runId: number, runKey: string) {
    const interval = 3000;
    const timeout = 5 * 60 * 1000;
    const start = Date.now();

    async function tick() {
      try {
        const run = await adminScrapingApi.getRun(runId);

        setSites((prev) => ({
          ...prev,
          [site]: {
            ...prev[site],
            lastRun: {
              run_id: run.id,
              run_key: run.run_key,
              site,
              status: run.status,
            },
          },
        }));

        if (run.status === "finished" || run.status === "failed") {
          const logs = await adminScrapingApi.getLogs(run.id);

          const duration =
            run.started_at && run.finished_at
              ? `${Math.round(
                  (new Date(run.finished_at).getTime() -
                    new Date(run.started_at).getTime()) /
                    1000,
                )}s`
              : "unknown";

          setSites((prev) => ({
            ...prev,
            [site]: {
              ...prev[site],
              logs: [
                ...prev[site].logs,
                `[${new Date().toLocaleTimeString()}] Run ${runKey} ${
                  run.status
                }. items_count=${run.items_count ?? 0}, duration=${duration}.`,
                ...logs.map(
                  (l) =>
                    `[${new Date(l.created_at).toLocaleTimeString()}] (${
                      l.level
                    }) ${l.message}`,
                ),
              ],
            },
          }));
          return;
        }

        if (Date.now() - start < timeout) {
          setTimeout(tick, interval);
        } else {
          setSites((prev) => ({
            ...prev,
            [site]: {
              ...prev[site],
              logs: [
                ...prev[site].logs,
                `[${new Date().toLocaleTimeString()}] Polling timed out for run ${runKey}.`,
              ],
            },
          }));
        }
      } catch (e: any) {
        setSites((prev) => ({
          ...prev,
          [site]: {
            ...prev[site],
            logs: [
              ...prev[site].logs,
              `[${new Date().toLocaleTimeString()}] ERROR while polling run ${runKey}: ${
                e.message ?? e
              }`,
            ],
          },
        }));
      }
    }

    tick();
  }

  async function startList(site: SiteKey) {
      setError(null);
      setSites((prev) => ({
        ...prev,
        [site]: {
          ...prev[site],
          isRunningList: true,
          logs: [
            ...prev[site].logs,
            `[${new Date().toLocaleTimeString()}] Queuing list step...`,
          ],
        },
      }));

      try {
        const data = await adminScrapingApi.startList(site);

        setSites((prev) => ({
          ...prev,
          [site]: {
            ...prev[site],
            isRunningList: false,
            lastRun: data,
            logs: [
              ...prev[site].logs,
              `[${new Date().toLocaleTimeString()}] Run ${data.run_key} queued (status: ${data.status}).`,
            ],
          },
        }));

        pollRun(site, data.run_id, data.run_key);
      } catch (e: any) {
        const msg = e.message ?? "Failed to start list step";
        setError(msg);
        setSites((prev) => ({
          ...prev,
          [site]: {
            ...prev[site],
            isRunningList: false,
            logs: [
              ...prev[site].logs,
              `[${new Date().toLocaleTimeString()}] ERROR: ${msg}`,
            ],
          },
        }));
      }
    }

  function toggleExpanded(site: SiteKey) {
    setSites((prev) => ({
      ...prev,
      [site]: { ...prev[site], expanded: !prev[site].expanded },
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
                      Last run: {state.lastRun.run_key} ({state.lastRun.status})
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {state.expanded ? "Hide stages" : "Show stages"}
                </span>
              </button>

              {state.expanded && (
                <div className="space-y-3 px-4 py-3 text-sm text-slate-100">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-medium text-slate-400">
                      Stages
                    </span>
                    <button
                      type="button"
                      onClick={() => startList(site)}
                      disabled={state.isRunningList}
                      className="inline-flex items-center rounded-xl border border-teal-500/70 bg-teal-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {state.isRunningList
                        ? "Starting list step..."
                        : "Start list (fetch links)"}
                    </button>
                  </div>

                  <div className="mt-3">
                    <div className="mb-1 text-xs font-medium text-slate-400">
                      Logs
                    </div>
                    <div className="max-h-60 overflow-auto rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100">
                      {state.logs.length === 0 ? (
                        <div className="text-slate-500">
                          No logs yet for this site.
                        </div>
                      ) : (
                        state.logs.map((line, idx) => (
                          <div key={idx}>{line}</div>
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
    </div>
  );
}