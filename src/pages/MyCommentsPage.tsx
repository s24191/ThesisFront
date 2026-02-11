import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { fetchMyComments } from "@/features/wines/api";
import type { MyComment } from "@/features/wines/types";

export const MyCommentsPage: React.FC = () => {
  const token = useAuthStore((s) => s.token);
  const [comments, setComments] = useState<MyComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchMyComments(token);
        setComments(data);
      } catch (e: any) {
        setError(e.message ?? "Failed to load comments");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [token]);

  if (!token) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">My comments</h1>
        <p className="text-sm text-gray-600">
          Please log in to see your comments.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">My comments</h1>

      {isLoading && <p className="mt-2 text-sm">Loading...</p>}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {!isLoading && !error && comments.length === 0 && (
        <p className="mt-2 text-sm text-gray-600">
          You have not written any comments yet.
        </p>
      )}

      <div className="mt-4 space-y-4">
        {comments.map((c) => (
          <div
            key={c.id}
            className="border rounded-lg p-3 bg-white shadow-sm flex flex-col gap-1"
          >
            <div className="flex items-center justify-between gap-2">
              <Link
                to={`/wines/${c.wine_id}`}
                className="text-sm font-medium text-indigo-700 hover:underline"
              >
                {c.wine_name}
              </Link>
              <span className="text-xs text-gray-500">
                {new Date(c.created_at).toLocaleString()}
              </span>
            </div>
            <div className="text-sm text-yellow-700">
              Rating: <span className="font-semibold">{c.rating}/10</span>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {c.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
