import React from "react";
import { useAuthStore } from "@/store/authStore.ts";

const API_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export type WineComment = {
  id: number;
  user_id: string;
  username: string;
  rating: number;
  text: string;
  created_at: string;
};

type Props = {
  wineId: number;
};

export const WineComments: React.FC<Props> = ({ wineId }) => {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const fetchUser = useAuthStore((s) => s.fetchUser);

  const [comments, setComments] = React.useState<WineComment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [newRating, setNewRating] = React.useState(7);
  const [newText, setNewText] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [editing, setEditing] = React.useState(false);

  const [showForm, setShowForm] = React.useState(false);


  const myComment = React.useMemo(
    () =>
      user ? comments.find((c) => c.user_id === user.id) ?? null : null,
    [comments, user],
  );

  const otherComments = React.useMemo(
    () =>
      myComment ? comments.filter((c) => c.id !== myComment.id) : comments,
    [comments, myComment],
  );

  React.useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token, user, fetchUser]);

  React.useEffect(() => {
    if (!wineId) return;

    const loadComments = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/wines/${wineId}/comments`);
        if (!res.ok) {
          throw new Error(`Failed to load reviews (${res.status})`);
        }
        const data = (await res.json()) as WineComment[];
        setComments(data);
      } catch (e: any) {
        console.error(e);
        setError(e.message ?? "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [wineId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newText.trim()) return;

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch(`${API_URL}/wines/${wineId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: newRating,
          text: newText.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to add review (${res.status})`);
      }

      const created = (await res.json()) as WineComment;
       setComments((prev) => {
        const withoutMine = prev.filter((c) => c.user_id !== created.user_id);
        return [created, ...withoutMine];
      });
      setNewText("");
      setNewRating(7);
      setEditing(false);
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "Failed to add review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
   if (!token) return;
   const ok = window.confirm(
    "Are you sure you want to delete your review? This cannot be undone."
   );
    if (!ok) return;

    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch(`${API_URL}/wines/${wineId}/comments/me`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok && res.status !== 404) {
        throw new Error(`Failed to delete review (${res.status})`);
      }
      setComments((prev) =>
        prev.filter((c) => !user || c.user_id !== user.id),
      );
      setEditing(false);
      setNewText("");
      setNewRating(7);
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "Failed to delete review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = () => {
    if (myComment) {
      setNewRating(myComment.rating);
      setNewText(myComment.text);
      setEditing(true);
    }
  };

  const handleStartNew = () => {
  setNewRating(7);
  setNewText("");
  setShowForm(true);
  };

  return (
        <section className="mt-8 border-t pt-6">
      <h2 className="text-lg font-semibold mb-3">Reviews</h2>

      {loading ? (
        <p className="text-sm text-gray-500">Loading reviews…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews yet.</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {myComment && (
  <li className="rounded-md border bg-white/80 px-3 py-2 shadow-sm">
    <div className="flex justify-between items-center mb-1">
      <span className="font-medium">Your review</span>
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span>
          {new Date(myComment.created_at).toLocaleDateString()} · rating{" "}
          {editing ? (
            <input
              type="number"
              min={1}
              max={10}
              value={newRating}
              onChange={(e) => setNewRating(Number(e.target.value) || 1)}
              className="w-14 border rounded px-1 py-0.5 text-xs ml-1"
            />
          ) : (
            myComment.rating
          )}
          /10
        </span>
        {!editing && (
          <>
            <button
              type="button"
              className="text-indigo-600 hover:underline"
              onClick={handleStartEdit}
            >
              Edit
            </button>
            <button
              type="button"
              className="text-red-600 hover:underline"
              onClick={handleDelete}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>

    {editing ? (
      <form
        onSubmit={handleSubmit}
        className="mt-1 space-y-2"
      >
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          rows={3}
          className="w-full border rounded px-2 py-1 text-sm"
          placeholder="Update your review…"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting || !newText.trim()}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setNewText("");
              setNewRating(7);
            }}
            className="rounded-md border px-3 py-1.5 text-xs text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    ) : (
      <p className="text-sm text-gray-800 whitespace-pre-line">
        {myComment.text}
      </p>
    )}
  </li>
)}

          {otherComments.map((c) => (
            <li
              key={c.id}
              className="rounded-md border bg-white/60 px-3 py-2 shadow-sm"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{c.username}</span>
                <span className="text-xs text-gray-600">
                  {new Date(c.created_at).toLocaleDateString()} · rating{" "}
                  {c.rating}/10
                </span>
              </div>
              <p className="text-sm text-gray-800 whitespace-pre-line">
                {c.text}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4">
        {!user ? (
          <p className="text-xs text-gray-500">
            You must be logged in to leave a review.
          </p>
        ) : !myComment ? (
          !showForm && (
            <button
              type="button"
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
              onClick={handleStartNew}
            >
              Write a review
            </button>
          )
        ) : !showForm ? null : null}

        {user && showForm && (
          <form onSubmit={handleSubmit} className="mt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <label className="text-xs font-medium text-gray-700">
                Your rating
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value) || 1)}
                className="w-16 border rounded px-2 py-1 text-sm"
              />
              <span className="text-xs text-gray-500">1–10</span>
            </div>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              rows={3}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="Write your review…"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || !newText.trim()}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
              >
                {submitting ? "Saving…" : myComment ? "Save changes" : "Submit review"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border px-3 py-1.5 text-xs text-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </section>

  );
};
