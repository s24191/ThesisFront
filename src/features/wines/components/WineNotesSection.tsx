import { useEffect, useMemo, useState } from "react";
import type { WineNote } from "@/features/wines/types";
import {
  fetchWineNotes,
  addWineNote,
  toggleWineNote,
} from "@/features/wines/api.ts";
import {useAuthStore} from "@/store/authStore.ts";

interface Props {
  wineId: number;
}

export function WineNotesSection({ wineId }: Props) {
  const [notes, setNotes] = useState<WineNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = !!user;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchWineNotes(
          wineId,
          isAuthenticated
        );
        if (!cancelled) setNotes(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [wineId, isAuthenticated]);

  const sortedNotes = useMemo(
    () =>
      [...notes].sort((a, b) => {
        if (b.votes_count !== a.votes_count) {
          return b.votes_count - a.votes_count;
        }
        return a.id - b.id;
      }),
    [notes]
  );

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    const text = newNote.trim();
    if (!text || !isAuthenticated) return;

    setSaving(true);
    try {
      const created = await addWineNote(wineId, text);

      setNotes((prev) => {
        const idx = prev.findIndex((n) => n.id === created.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = created;
          return copy;
        }
        return [...prev, created];
      });
      setNewNote("");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(note: WineNote) {
    if (!isAuthenticated) return;

    const prevNotes = notes;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === note.id
          ? {
              ...n,
              user_voted: !n.user_voted,
              votes_count: n.votes_count + (n.user_voted ? -1 : 1),
            }
          : n
      )
    );

    try {
      const updated = await toggleWineNote(wineId, note.id);
      setNotes((prev) =>
        prev.map((n) => (n.id === updated.id ? updated : n))
      );
    } catch {
      setNotes(prevNotes);
    }
  }

  if (loading) {
    return (
      <section className="mt-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-2">
          Notes
        </h3>
        <p className="text-sm text-gray-400">Loading notes…</p>
      </section>
    );
  }

  return (
    <section className="mt-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-2">
        Notes
      </h3>

      {/* Tag chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {sortedNotes.map((note) => {
          const active = isAuthenticated && note.user_voted;
          return (
            <button
              key={note.id}
              type="button"
              onClick={() => handleToggle(note)}
              disabled={!isAuthenticated}
              className={[
                "px-2 py-1 rounded-full text-xs border transition",
                active
                  ? "bg-sky-600 border-sky-500 text-white"
                  : "bg-slate-800/70 border-slate-600 text-slate-100 hover:border-sky-400",
                !isAuthenticated && "opacity-60 cursor-not-allowed",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {note.text}
              <span className="ml-1 text-[10px] opacity-80">
                {note.votes_count}
              </span>
            </button>
          );
        })}

        {sortedNotes.length === 0 && (
          <span className="text-xs text-gray-500">
            No notes yet. Be the first to add one.
          </span>
        )}
      </div>

      {/* Add note */}
      <form onSubmit={handleAddNote} className="flex gap-2">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={
            isAuthenticated
              ? "Add a new note (e.g. 'Jammy', 'High acidity')"
              : "Log in to add notes"
          }
          disabled={!isAuthenticated || saving}
          className="flex-1 bg-slate-900/70 border border-slate-700 rounded px-2 py-1 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-sky-500"
        />
        <button
          type="submit"
          disabled={!isAuthenticated || saving || !newNote.trim()}
          className="px-3 py-1 rounded text-xs bg-sky-600 text-white disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {!isAuthenticated && (
        <p className="mt-1 text-[11px] text-gray-500">
          You can view notes without logging in, but you must log in to add or
          vote on them.
        </p>
      )}
    </section>
  );
}
