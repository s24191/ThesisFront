import {
  useEffect,
  useState,
} from "react";

import {
  useAuthStore,
} from "@/features/auth/store/authStore";

import {
  fetchMyTasteVote,
  fetchTasteSummary,
  upsertMyTasteVote,
} from "@/features/wines/api";

import type {
  WineTasteSummary,
  WineTasteVote,
} from "@/features/wines/types";

type WineTasteSectionProps = {
  wineId: number;
};

type TasteField =
  | "body"
  | "tannin"
  | "sweetness"
  | "acidity";

type TasteDescriptor = {
  field: TasteField;
  label: string;
  leftLabel: string;
  rightLabel: string;
};

const TASTE_DESCRIPTORS: TasteDescriptor[] = [
  {
    field: "body",
    label: "Body",
    leftLabel: "Light",
    rightLabel: "Bold",
  },
  {
    field: "tannin",
    label: "Tannin",
    leftLabel: "Smooth",
    rightLabel: "Tannic",
  },
  {
    field: "sweetness",
    label: "Sweetness",
    leftLabel: "Dry",
    rightLabel: "Sweet",
  },
  {
    field: "acidity",
    label: "Acidity",
    leftLabel: "Soft",
    rightLabel: "Acidic",
  },
];

const clamp0to10 = (
  value: number,
): number => Math.max(
  0,
  Math.min(10, value),
);

const createDefaultVote = (): WineTasteVote => ({
  body: 5,
  tannin: 5,
  sweetness: 5,
  acidity: 5,
});

function makeSegment(
  average: number | null | undefined,
): {
  start: string;
  width: string;
} {
  if (average === null || average === undefined) {
    return {
      start: "0%",
      width: "0%",
    };
  }

  const widthFraction = 0.15;

  const normalizedAverage =
    clamp0to10(average) / 10;

  const left = Math.max(
    0,
    Math.min(
      1 - widthFraction,
      normalizedAverage - widthFraction / 2,
    ),
  );

  return {
    start: `${left * 100}%`,
    width: `${widthFraction * 100}%`,
  };
}

function formatTasteValue(
  value: number | null | undefined,
): string {
  if (value === null || value === undefined) {
    return "–";
  }

  return Number(value).toFixed(1);
}

export const WineTasteSection = ({
  wineId,
}: WineTasteSectionProps) => {
  const user = useAuthStore(
    (state) => state.user,
  );

  const isAuthenticated = Boolean(user);

  const [summary, setSummary] = useState<
    WineTasteSummary | null
  >(null);

  const [myVote, setMyVote] = useState<
    WineTasteVote | null
  >(null);

  const [isLoadingSummary, setIsLoadingSummary] =
    useState(false);

  const [isLoadingMyVote, setIsLoadingMyVote] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [summaryError, setSummaryError] =
    useState<string | null>(null);

  const [voteError, setVoteError] =
    useState<string | null>(null);

  const [isVoteOpen, setIsVoteOpen] =
    useState(false);

  useEffect(() => {
    if (!wineId) {
      setSummary(null);
      setIsLoadingSummary(false);
      setSummaryError(null);

      return;
    }

    let isCurrent = true;

    const loadTasteSummary = async () => {
      try {
        setIsLoadingSummary(true);
        setSummaryError(null);

        const data = await fetchTasteSummary(
          wineId,
        );

        if (isCurrent) {
          setSummary(data);
        }
      } catch {
        if (isCurrent) {
          setSummaryError(
            "We couldn’t load the taste profile.",
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoadingSummary(false);
        }
      }
    };

    void loadTasteSummary();

    return () => {
      isCurrent = false;
    };
  }, [
    wineId,
  ]);

  useEffect(() => {
    if (!wineId || !isAuthenticated) {
      setMyVote(null);
      setIsLoadingMyVote(false);

      return;
    }

    let isCurrent = true;

    const loadMyTasteVote = async () => {
      try {
        setIsLoadingMyVote(true);
        setVoteError(null);

        const vote = await fetchMyTasteVote(
          wineId,
        );

        if (isCurrent) {
          setMyVote(vote);
        }
      } catch {
        /*
         * A failed personal-vote request should not hide the
         * public taste summary. Treat it as unavailable/no vote
         * while retaining an optional error message for the user.
         */
        if (isCurrent) {
          setMyVote(null);
          setVoteError(
            "We couldn’t load your taste vote.",
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoadingMyVote(false);
        }
      }
    };

    void loadMyTasteVote();

    return () => {
      isCurrent = false;
    };
  }, [
    wineId,
    isAuthenticated,
  ]);

  const handleChange = (
    field: TasteField,
    value: number,
  ) => {
    const clampedValue = clamp0to10(value);

    setMyVote((previousVote) => ({
      ...(previousVote ?? createDefaultVote()),
      [field]: clampedValue,
    }));
  };

  const handleSave = async () => {
    if (!isAuthenticated || !myVote) {
      return;
    }

    try {
      setIsSaving(true);
      setVoteError(null);

      const savedVote = await upsertMyTasteVote(
        wineId,
        myVote,
      );

      setMyVote(savedVote);

      /*
       * Re-fetch the public aggregate so the profile reflects
       * the user’s newly saved vote.
       */
      const updatedSummary =
        await fetchTasteSummary(wineId);

      setSummary(updatedSummary);

      setIsVoteOpen(false);
    } catch {
      setVoteError(
        "We couldn’t save your taste vote. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openVoteForm = () => {
    setVoteError(null);

    setMyVote((previousVote) =>
      previousVote ?? createDefaultVote(),
    );

    setIsVoteOpen(true);
  };

  const votesCount = summary?.votes_count ?? 0;

  return (
    <>
      <section className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/70 p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              Taste profile
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {votesCount === 0
                ? "No taste votes yet"
                : `${votesCount} ${
                    votesCount === 1
                      ? "taste vote"
                      : "taste votes"
                  }`}
            </p>
          </div>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={openVoteForm}
              disabled={isLoadingMyVote}
              className="rounded-full bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoadingMyVote
                ? "Loading…"
                : myVote
                  ? "Edit your vote"
                  : "Rate taste"}
            </button>
          ) : (
            <span className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs text-slate-400">
              Sign in to vote
            </span>
          )}
        </div>

        {summaryError && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-rose-400/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-100"
          >
            {summaryError}
          </div>
        )}

        {isLoadingSummary ? (
          <div
            aria-live="polite"
            className="rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-5 text-sm text-slate-400"
          >
            Loading taste profile…
          </div>
        ) : summaryError ? null : votesCount === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-4 py-5 text-center">
            <p className="text-sm text-slate-400">
              This wine has no community taste profile yet.
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Be the first person to describe its body,
              tannins, sweetness, and acidity.
            </p>
          </div>
        ) : (
          <div className="grid gap-x-7 gap-y-4 sm:grid-cols-2">
            {TASTE_DESCRIPTORS.map(
              ({
                field,
                label,
                leftLabel,
                rightLabel,
              }) => {
                const value = summary?.[field];

                const segment = makeSegment(value);

                return (
                  <TasteProfileRow
                    key={field}
                    label={label}
                    leftLabel={leftLabel}
                    rightLabel={rightLabel}
                    value={value}
                    startPercent={segment.start}
                    widthPercent={segment.width}
                  />
                );
              },
            )}
          </div>
        )}

        {!isAuthenticated && (
          <p className="mt-4 text-xs text-slate-500">
            Sign in to vote and help create a more
            accurate taste profile.
          </p>
        )}
      </section>

      {isAuthenticated && isVoteOpen && myVote && (
        <TasteVoteModal
          vote={myVote}
          saving={isSaving}
          error={voteError}
          onChange={handleChange}
          onSave={() => {
            void handleSave();
          }}
          onClose={() => {
            if (!isSaving) {
              setIsVoteOpen(false);
              setVoteError(null);
            }
          }}
        />
      )}
    </>
  );
};

type TasteProfileRowProps = {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number | null | undefined;
  startPercent: string;
  widthPercent: string;
};

const TasteProfileRow = ({
  label,
  leftLabel,
  rightLabel,
  value,
  startPercent,
  widthPercent,
}: TasteProfileRowProps) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <span className="text-xs font-semibold text-slate-200">
        {label}
      </span>

      <span className="text-xs font-semibold text-teal-200">
        {formatTasteValue(value)}

        <span className="ml-0.5 text-slate-500">
          /10
        </span>
      </span>
    </div>

    <div className="relative h-2 overflow-hidden rounded-full bg-slate-800">
      <div
        aria-hidden="true"
        className="absolute top-0 h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-300"
        style={{
          left: startPercent,
          width: widthPercent,
        }}
      />
    </div>

    <div className="mt-1 flex justify-between text-[10px] text-slate-500">
      <span>
        {leftLabel}
      </span>

      <span>
        {rightLabel}
      </span>
    </div>
  </div>
);

type TasteVoteModalProps = {
  vote: WineTasteVote;
  saving: boolean;
  error: string | null;
  onChange: (
    field: TasteField,
    value: number,
  ) => void;
  onSave: () => void;
  onClose: () => void;
};

const TasteVoteModal = ({
  vote,
  saving,
  error,
  onChange,
  onSave,
  onClose,
}: TasteVoteModalProps) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="taste-vote-title"
  >
    <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3
            id="taste-vote-title"
            className="text-lg font-semibold text-slate-100"
          >
            Rate this wine’s taste
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Move each slider from 0 to 10.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          aria-label="Close taste voting dialog"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          ×
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-rose-400/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-100"
        >
          {error}
        </div>
      )}

      <div className="space-y-5">
        {TASTE_DESCRIPTORS.map(
          ({
            field,
            label,
            leftLabel,
            rightLabel,
          }) => (
            <UserTasteSlider
              key={field}
              label={label}
              leftLabel={leftLabel}
              rightLabel={rightLabel}
              value={vote[field]}
              disabled={saving}
              onChange={(value) => {
                onChange(field, value);
              }}
            />
          ),
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="rounded-full border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-full bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving…"
            : "Save taste vote"}
        </button>
      </div>
    </div>
  </div>
);

type UserTasteSliderProps = {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
};

const UserTasteSlider = ({
  label,
  leftLabel,
  rightLabel,
  value,
  disabled,
  onChange,
}: UserTasteSliderProps) => (
  <div>
    <div className="mb-2 flex items-center justify-between">
      <span className="text-sm font-semibold text-slate-200">
        {label}
      </span>

      <span className="rounded-full border border-teal-400/30 bg-teal-400/10 px-2 py-0.5 text-xs font-semibold text-teal-200">
        {value}

        <span className="text-teal-100/60">
          /10
        </span>
      </span>
    </div>

    <input
      type="range"
      min={0}
      max={10}
      step={1}
      value={value}
      disabled={disabled}
      onChange={(event) => {
        onChange(
          Number(event.target.value),
        );
      }}
      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
    />

    <div className="mt-1 flex justify-between text-[10px] text-slate-500">
      <span>
        {leftLabel}
      </span>

      <span>
        {rightLabel}
      </span>
    </div>
  </div>
);