import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  profileApi,
} from "@/features/profile/api/profileApi";

import type {
  MyComment,
} from "@/features/wines/types";

export const MyCommentsPage = () => {
  const [comments, setComments] = useState<
    MyComment[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadComments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data =
          await profileApi.getComments();

        setComments(data);
      } catch {
        setError(
          "We couldn’t load your comments.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadComments();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-6 sm:mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
            Your activity
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            My comments
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            A record of your ratings and tasting thoughts.
          </p>
        </header>

        {isLoading && (
          <section className="grid min-h-52 place-items-center rounded-2xl border border-slate-700 bg-slate-900/50 p-6">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span
                aria-hidden="true"
                className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-teal-300"
              />

              Loading comments…
            </div>
          </section>
        )}

        {error && (
          <section
            role="alert"
            className="rounded-2xl border border-rose-400/40 bg-rose-950/40 p-4 text-sm text-rose-100"
          >
            <p className="font-semibold">
              We couldn’t load your comments.
            </p>

            <p className="mt-1 text-rose-200/80">
              {error}
            </p>
          </section>
        )}

        {!isLoading && !error && comments.length === 0 && (
          <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-14 text-center">
            <p className="text-base font-semibold text-slate-200">
              No comments yet
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Rate a wine or share a tasting note to see
              your activity here.
            </p>
          </section>
        )}

        {!isLoading && !error && comments.length > 0 && (
          <div className="space-y-4">
            {comments.map((comment) => (
              <article
                key={comment.id}
                className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <Link
                      to={`/wines/${comment.wine_id}`}
                      className="line-clamp-1 text-base font-bold text-slate-100 transition hover:text-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-400/70"
                    >
                      {comment.wine_name}
                    </Link>

                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(
                        comment.created_at,
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-200">
                    <span aria-hidden="true">
                      ★
                    </span>

                    {comment.rating}
                    /10
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                  {comment.text}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};