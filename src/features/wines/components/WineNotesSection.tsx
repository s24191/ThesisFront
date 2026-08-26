import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAuthStore,
} from "@/features/auth/store/authStore";

import {
  addWineNote,
  fetchWineNotes,
  toggleWineNote,
} from "@/features/wines/api";

import type {
  WineNote,
} from "@/features/wines/types";

type WineNotesSectionProps = {
  wineId: number;
};

export function WineNotesSection({
  wineId,
}: WineNotesSectionProps) {
  const [notes, setNotes] = useState<
    WineNote[]
  >([]);

  const [newNote, setNewNote] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const [pendingNoteIds, setPendingNoteIds] =
    useState<Set<number>>(
      () => new Set(),
    );

  const user = useAuthStore(
    (state) => state.user,
  );

  const isAuthenticated = Boolean(user);

  useEffect(() => {
    if (!wineId) {
      setNotes([]);
      setIsLoading(false);
      setError(null);

      return;
    }

    let isCurrent = true;

    const loadNotes = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchWineNotes(
          wineId,
          isAuthenticated,
        );

        if (isCurrent) {
          setNotes(data);
        }
      } catch {
        if (isCurrent) {
          setError(
            "We couldn’t load community notes.",
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    void loadNotes();

    return () => {
      isCurrent = false;
    };
  }, [
    wineId,
    isAuthenticated,
  ]);

  const sortedNotes = useMemo(
    () =>
      [...notes].sort((firstNote, secondNote) => {
        if (
          secondNote.votes_count !==
          firstNote.votes_count
        ) {
          return (
            secondNote.votes_count -
            firstNote.votes_count
          );
        }

        return firstNote.id - secondNote.id;
      }),
    [notes],
  );

  const handleAddNote = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const text = newNote.trim();

    if (!text || !isAuthenticated) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const createdNote = await addWineNote(
        wineId,
        text,
      );

      setNotes((currentNotes) => {
        const existingIndex =
          currentNotes.findIndex(
            (note) =>
              note.id === createdNote.id,
          );

        if (existingIndex === -1) {
          return [
            ...currentNotes,
            createdNote,
          ];
        }

        const nextNotes = [...currentNotes];

        nextNotes[existingIndex] = createdNote;

        return nextNotes;
      });

      setNewNote("");
    } catch {
      setError(
        "We couldn’t add your note. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleNote = async (
    note: WineNote,
  ) => {
    if (
      !isAuthenticated ||
      pendingNoteIds.has(note.id)
    ) {
      return;
    }

    const previousNotes = notes;

    setPendingNoteIds((currentIds) => {
      const nextIds = new Set(currentIds);

      nextIds.add(note.id);

      return nextIds;
    });

    setNotes((currentNotes) =>
      currentNotes.map((currentNote) =>
        currentNote.id === note.id
          ? {
              ...currentNote,
              user_voted:
                !currentNote.user_voted,
              votes_count:
                currentNote.votes_count +
                (currentNote.user_voted
                  ? -1
                  : 1),
            }
          : currentNote,
      ),
    );

    try {
      const updatedNote = await toggleWineNote(
        wineId,
        note.id,
      );

      setNotes((currentNotes) =>
        currentNotes.map((currentNote) =>
          currentNote.id === updatedNote.id
            ? updatedNote
            : currentNote,
        ),
      );
    } catch {
      setNotes(previousNotes);

      setError(
        "We couldn’t update your vote. Please try again.",
      );
    } finally {
      setPendingNoteIds((currentIds) => {
        const nextIds = new Set(currentIds);

        nextIds.delete(note.id);

        return nextIds;
      });
    }
  };

  if (isLoading) {
    return (
      <section className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/70 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Community notes
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Tags voted on by wine users
            </p>
          </div>

          <span
            aria-live="polite"
            className="rounded-full border border-slate-600 bg-slate-800 px-2.5 py-1 text-xs text-slate-400"
          >
            Loading…
          </span>
        </div>
      </section>
    );
  }

  if (error && !notes.length) {
    return (
      <section
        role="alert"
        className="mt-6 rounded-2xl border border-rose-400/40 bg-rose-950/30 p-4 shadow-sm"
      >
        <h3 className="text-sm font-semibold text-rose-100">
          Community notes unavailable
        </h3>

        <p className="mt-1 text-xs leading-5 text-rose-200/80">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/70 p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-100">
          Community notes
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          Community descriptors for this wine
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-rose-400/40 bg-rose-950/30 px-3.5 py-3 text-xs leading-5 text-rose-100"
        >
          {error}
        </div>
      )}

      {sortedNotes.length === 0 ? (
        <div className="mb-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-4 py-5 text-center">
          <p className="text-sm text-slate-400">
            No community notes yet.
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Add descriptors such as “Cherry”, “Dry”, or
            “High acidity”.
          </p>
        </div>
      ) : (
        <div className="mb-4 flex flex-wrap gap-2">
          {sortedNotes.map((note) => {
            const isActive =
              isAuthenticated &&
              note.user_voted;

            const isPending =
              pendingNoteIds.has(note.id);

            return (
              <button
                key={note.id}
                type="button"
                onClick={() => {
                  void handleToggleNote(note);
                }}
                disabled={
                  !isAuthenticated ||
                  isPending
                }
                title={
                  !isAuthenticated
                    ? "Sign in to vote"
                    : isPending
                      ? "Saving your vote…"
                      : isActive
                        ? "Remove your vote"
                        : "Vote for this note"
                }
                aria-pressed={isActive}
                className={[
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  isActive
                    ? "border-teal-400/70 bg-teal-950 text-teal-100 shadow-[inset_0_0_0_1px_rgba(45,212,191,0.15)]"
                    : "border-slate-600 bg-slate-800 text-slate-100 hover:border-teal-400/70 hover:bg-slate-700 hover:text-white",
                  !isAuthenticated || isPending
                    ? "cursor-not-allowed opacity-60"
                    : "",
                ].join(" ")}
              >
                <span>
                  {note.text}
                </span>

                <span
                  className={[
                    "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    isActive
                      ? "bg-teal-400/15 text-teal-100"
                      : "bg-slate-700 text-slate-200",
                  ].join(" ")}
                >
                  {note.votes_count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <form
        onSubmit={handleAddNote}
        className="flex flex-col gap-2 border-t border-slate-700 pt-4 sm:flex-row"
      >
        <label
          htmlFor={`wine-note-${wineId}`}
          className="sr-only"
        >
          Add a community note
        </label>

        <input
          id={`wine-note-${wineId}`}
          type="text"
          value={newNote}
          maxLength={120}
          onChange={(event) => {
            setNewNote(event.target.value);
          }}
          placeholder={
            isAuthenticated
              ? "Add a note, for example: Cherry"
              : "Sign in to add or vote on notes"
          }
          disabled={
            !isAuthenticated ||
            isSaving
          }
          className="min-w-0 flex-1 rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={
            !isAuthenticated ||
            isSaving ||
            !newNote.trim()
          }
          className="rounded-xl bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving
            ? "Adding…"
            : "Add note"}
        </button>
      </form>

      {!isAuthenticated && (
        <p className="mt-3 text-xs text-slate-500">
          Sign in to add notes or vote for descriptors
          that match this wine.
        </p>
      )}
    </section>
  );
};