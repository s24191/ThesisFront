import {
  useEffect,
  useState,
} from "react";

import {
  adminScrapingApi,
  type TranslationReviewItem,
  type TranslationReviewOccurrence,
} from "@/features/admin/adminScrapingApi";


type ReviewIssue = TranslationReviewItem & {
  occurrences: TranslationReviewOccurrence[];
};

type TranslationIssuesModalProps = {
  open: boolean;
  runId: number | null;
  siteName: string;
  onClose: () => void;
};


export function TranslationIssuesModal({
  open,
  runId,
  siteName,
  onClose,
}: TranslationIssuesModalProps) {
  const [issues, setIssues] = useState<ReviewIssue[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingIssue, setEditingIssue] =
    useState<ReviewIssue | null>(null);

  const [translationValue, setTranslationValue] =
    useState("");

  const [confirmingIssue, setConfirmingIssue] =
    useState<ReviewIssue | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  async function loadIssues() {
    if (!runId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reviewItems =
        await adminScrapingApi.listTranslationReviews(
          "pending",
        );

      const issuesWithOccurrences = await Promise.all(
        reviewItems.map(async (item) => {
          const occurrences =
            await adminScrapingApi.getTranslationReviewOccurrences(
              item.id,
            );

          return {
            ...item,
            occurrences: occurrences.filter(
              (occurrence) =>
                occurrence.original_run_id === runId &&
                occurrence.status === "pending",
            ),
          };
        }),
      );

      setIssues(
        issuesWithOccurrences.filter(
          (issue) => issue.occurrences.length > 0,
        ),
      );
    } catch (e: any) {
      setError(
        e.message ??
          "Failed to load translation review issues",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    setEditingIssue(null);
    setConfirmingIssue(null);
    setTranslationValue("");

    void loadIssues();
  }, [open, runId]);

  function startTranslation(issue: ReviewIssue) {
    setEditingIssue(issue);
    setTranslationValue("");
    setConfirmingIssue(null);
  }

  function continueToConfirmation() {
    const trimmedValue = translationValue.trim();

    if (!trimmedValue) {
      setError("Translation cannot be empty.");
      return;
    }

    if (!editingIssue) {
      return;
    }

    setError(null);
    setTranslationValue(trimmedValue);
    setConfirmingIssue(editingIssue);
  }

  async function confirmTranslation() {
    if (!confirmingIssue) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await adminScrapingApi.resolveTranslationReview(
        confirmingIssue.id,
        translationValue,
      );

      setEditingIssue(null);
      setConfirmingIssue(null);
      setTranslationValue("");

      await loadIssues();
    } catch (e: any) {
      setError(
        e.message ??
          "Failed to save translation mapping",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function ignoreIssue(issue: ReviewIssue) {
    const shouldIgnore = window.confirm(
      `Ignore "${issue.source_value}" for ` +
        `"${issue.field_name}"?`,
    );

    if (!shouldIgnore) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await adminScrapingApi.ignoreTranslationReview(
        issue.id,
      );

      await loadIssues();
    } catch (e: any) {
      setError(
        e.message ??
          "Failed to ignore translation issue",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!open) {
    return null;
  }

  const isConfirming = Boolean(confirmingIssue);
  const isEditing = Boolean(editingIssue);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="translation-issues-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              id="translation-issues-title"
              className="text-base font-semibold text-slate-100"
            >
              Translation review issues
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {siteName} · scrape run #{runId}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            aria-label="Close translation issues"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {isConfirming && confirmingIssue ? (
          <div className="mt-6">
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4">
              <p className="text-sm font-medium text-amber-200">
                Confirm translation
              </p>

              <div className="mt-3 rounded-lg bg-slate-950 px-3 py-3 font-mono text-sm text-slate-100">
                "{confirmingIssue.source_value}" : "
                {translationValue}"
              </div>

              <p className="mt-3 text-sm text-slate-400">
                This activates the mapping for the field:
                {" "}
                <span className="font-medium text-slate-200">
                  {confirmingIssue.field_name}
                </span>
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmingIssue(null);
                }}
                disabled={isSaving}
                className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => {
                  void confirmTranslation();
                }}
                disabled={isSaving}
                className="rounded-xl border border-teal-500/70 bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? "Saving..."
                  : "Confirm translation"}
              </button>
            </div>
          </div>
        ) : isEditing && editingIssue ? (
          <div className="mt-6">
            <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Field
              </div>

              <div className="mt-1 text-sm text-slate-100">
                {editingIssue.field_name}
              </div>

              <div className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                Source value
              </div>

              <div className="mt-1 font-mono text-sm text-amber-200">
                {editingIssue.source_value}
              </div>

              <label className="mt-5 block text-sm font-medium text-slate-200">
                Canonical translation
              </label>

              <input
                autoFocus
                value={translationValue}
                onChange={(event) => {
                  setTranslationValue(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    continueToConfirmation();
                  }
                }}
                placeholder="For example: fortified"
                className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-teal-500"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingIssue(null);
                  setTranslationValue("");
                }}
                className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700"
              >
                Back to issues
              </button>

              <button
                type="button"
                onClick={continueToConfirmation}
                className="rounded-xl border border-teal-500/70 bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-500"
              >
                Review translation
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            {isLoading ? (
              <div className="text-sm text-slate-400">
                Loading translation issues...
              </div>
            ) : issues.length === 0 ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-5 text-sm text-emerald-200">
                No pending translation issues exist for this run.
              </div>
            ) : (
              <div className="space-y-3">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="rounded-xl border border-slate-700 bg-slate-950/50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          {issue.field_name}
                        </div>

                        <div className="mt-1 font-mono text-sm text-amber-200">
                          {issue.source_value}
                        </div>

                        <div className="mt-2 text-xs text-slate-400">
                          Affects {issue.occurrences.length} URL
                          {issue.occurrences.length === 1
                            ? ""
                            : "s"} in this scrape run.
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            startTranslation(issue);
                          }}
                          disabled={isSaving}
                          className="rounded-xl border border-teal-500/70 bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Translate
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            void ignoreIssue(issue);
                          }}
                          disabled={isSaving}
                          className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Ignore
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      {issue.occurrences.slice(0, 3).map(
                        (occurrence) => (
                          <a
                            key={occurrence.id}
                            href={occurrence.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="block truncate text-xs text-sky-300 hover:text-sky-200 hover:underline"
                          >
                            {occurrence.source_url}
                          </a>
                        ),
                      )}

                      {issue.occurrences.length > 3 && (
                        <div className="text-xs text-slate-500">
                          +{issue.occurrences.length - 3} more
                          affected URLs
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}