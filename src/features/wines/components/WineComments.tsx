import type {WineComment} from "@/features/wines/types";
import {useEffect, useMemo, useState, type FormEvent, type FC,} from "react";
import {fetchWineComments, deleteMyWineComment, saveWineComment} from "@/features/wines/api";
import {useAuthStore} from "@/features/auth/store/authStore.ts";

const INITIAL_REVIEWS_LIMIT = 5;

type Props = {
  wineId: number;
};

type RatingPickerProps = {
  value: number;
  disabled?: boolean;
  onChange: (rating: number) => void;
};

function RatingPicker({
  value,
  disabled = false,
  onChange,
}: RatingPickerProps) {
  return (
    <div
      className="flex flex-wrap gap-1"
      aria-label="Choose rating from 1 to 10"
    >
      {Array.from(
        {length: 10},
        (_, index) => index + 1,
      ).map((rating) => {
        const selected = rating === value;

        return (
          <button
            key={rating}
            type="button"
            disabled={disabled}
            aria-label={`Rate ${rating} out of 10`}
            aria-pressed={selected}
            onClick={() => onChange(rating)}
            className={[
              "inline-flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold transition",
              selected
                ? "border-amber-400 bg-amber-400 text-slate-950"
                : "border-slate-600 bg-slate-800 text-slate-200 hover:border-amber-400 hover:text-amber-300",
              disabled
                ? "cursor-not-allowed opacity-50"
                : "",
            ].join(" ")}
          >
            {rating}
          </button>
        );
      })}
    </div>
  );
}

function RatingBadge({
  rating,
}: {
  rating: number;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-1 text-xs font-semibold text-amber-300">
      <span aria-hidden="true">★</span>
      {rating.toFixed(1)}
      <span className="text-amber-200/70">/10</span>
    </span>
  );
}

export const WineComments: FC<Props> = ({
  wineId,
}) => {
  const token = useAuthStore(
    (state) => state.token,
  );
  const user = useAuthStore(
    (state) => state.user,
  );

  const [comments, setComments] =useState<
    WineComment[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  const [newRating, setNewRating] = useState(7);

  const [newText, setNewText] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [editing, setEditing] = useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState(false);

  const [visibleReviewsCount, setVisibleReviewsCount] =
    useState(INITIAL_REVIEWS_LIMIT);

  const myComment = useMemo(
    () =>
      user
        ? comments.find(
            (comment) =>
              comment.user_id === user.id,
          ) ?? null
        : null,
    [comments, user],
  );

  const otherComments = useMemo(
    () =>
      myComment
        ? comments.filter(
            (comment) =>
              comment.id !== myComment.id,
          )
        : comments,
    [comments, myComment],
  );

  const visibleOtherComments = useMemo(
    () =>
      otherComments.slice(
        0,
        visibleReviewsCount,
      ),
    [otherComments, visibleReviewsCount],
  );

  const hiddenReviewsCount = Math.max(
    0,
    otherComments.length - visibleReviewsCount,
  );

  const totalReviewsCount = comments.length;


  useEffect(() => {
  if (!wineId) {
    setComments([]);
    setLoading(false);

    return;
  }

  let isCurrent = true;
  const loadComments = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchWineComments(
          wineId,
        );

        if (isCurrent) {
          setComments(data);
        }
      } catch {
        if (isCurrent) {
          setError(
            "We couldn’t load community reviews.",
          );
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    void loadComments();

    return () => {
      isCurrent = false;
    };
  }, [
    wineId,
  ]);

  function resetReviewForm() {
    setNewRating(7);
    setNewText("");
    setEditing(false);
    setShowForm(false);
    setShowDeleteConfirmation(false);
  }

  function handleStartNew() {
    setNewRating(7);
    setNewText("");
    setEditing(false);
    setShowForm(true);
    setShowDeleteConfirmation(false);
  }

  function handleStartEdit() {
    if (!myComment) {
      return;
    }

    setNewRating(myComment.rating);
    setNewText(myComment.text);
    setEditing(true);
    setShowForm(true);
    setShowDeleteConfirmation(false);
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const savedComment = await saveWineComment(
        wineId,
        {
          rating: newRating,
          text: newText.trim(),
        },
      );

      setComments((previousComments) => {
        const commentsWithoutMine =
          previousComments.filter(
            (comment) =>
              comment.user_id !==
              savedComment.user_id,
          );

        return [
          savedComment,
          ...commentsWithoutMine,
        ];
      });

      resetReviewForm();
    } catch {
      setError(
        "We couldn’t save your review. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async () => {
    if (!token || !user) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await deleteMyWineComment(
        wineId,
      );

      setComments((previousComments) =>
        previousComments.filter(
          (comment) =>
            comment.user_id !== user.id,
        ),
      );

      resetReviewForm();
    } catch {
      setError(
        "We couldn’t delete your review. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <section className="mt-8 border-t border-slate-700 pt-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-100">
            Community reviews
          </h2>

          <span className="h-5 w-px bg-slate-700" />

          <span className="text-sm text-slate-400">
            {totalReviewsCount === 0
              ? "No reviews yet"
              : `${totalReviewsCount} ${
                  totalReviewsCount === 1
                    ? "review"
                    : "reviews"
                }`}
          </span>
        </div>

        {user && !showForm && (
          <button
            type="button"
            onClick={
              myComment
                ? handleStartEdit
                : handleStartNew
            }
            className="inline-flex items-center rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
          >
            {myComment
              ? "Edit your review"
              : "Write a review"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/50 bg-rose-950/50 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {user && showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-5 rounded-2xl border border-teal-400/40 bg-slate-900 p-4 shadow-sm"
        >
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                {editing
                  ? "Edit your review"
                  : "Write a review"}
              </h3>
            </div>

            <RatingBadge rating={newRating} />
          </div>

          <fieldset className="mb-4">
            <legend className="mb-2 block text-sm font-medium text-slate-200">
              Your rating
            </legend>

            <RatingPicker
              value={newRating}
              disabled={submitting}
              onChange={setNewRating}
            />
          </fieldset>

          <div className="mb-4">
            <label
              htmlFor={`wine-review-${wineId}`}
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Review text{" "}
              <span className="font-normal text-slate-500">
                optional
              </span>
            </label>

            <textarea
              id={`wine-review-${wineId}`}
              value={newText}
              onChange={(event) =>
                setNewText(event.target.value)
              }
              rows={4}
              maxLength={2000}
              disabled={submitting}
              placeholder="What did you think about this wine?"
              className="w-full resize-y rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Saving…"
                  : editing
                    ? "Save changes"
                    : "Submit rating"}
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={resetReviewForm}
                className="rounded-full border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </div>

            {editing && (
              <button
                type="button"
                disabled={submitting}
                onClick={() =>
                  setShowDeleteConfirmation(true)
                }
                className="rounded-full border border-rose-400/50 bg-rose-950/40 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-900/70 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Delete review
              </button>
            )}
          </div>

          {editing && showDeleteConfirmation && (
            <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3">
              <p className="text-sm text-rose-100">
                Delete your rating and review? This action
                cannot be undone.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void handleDelete()}
                  className="rounded-full bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Deleting…"
                    : "Delete review"}
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    setShowDeleteConfirmation(false)
                  }
                  className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Keep review
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {!user && (
        <div className="mb-5 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
          Sign in to leave a rating or review.
        </div>
      )}

      {myComment && !showForm && (
        <div className="mb-5 rounded-2xl border border-teal-400/50 bg-teal-950/25 p-4">
          <div className="mb-3 flex flex-wrap items-start gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-teal-200">
                  Your review
                </h3>

                <RatingBadge
                  rating={myComment.rating}
                />
              </div>

              <p className="mt-1 text-xs text-slate-400">
                Posted{" "}
                {new Date(
                  myComment.created_at,
                ).toLocaleDateString()}
              </p>
            </div>
          </div>

          {myComment.text.trim() && (
            <p className="whitespace-pre-line text-sm leading-6 text-slate-200">
              {myComment.text}
            </p>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">
          Loading reviews…
        </p>
      ) : otherComments.length === 0 ? (
        !myComment && (
          <div className="rounded-xl border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-500">
            No reviews yet. Be the first to rate this wine.
          </div>
        )
      ) : (
        <div>
          <ul className="space-y-3">
            {visibleOtherComments.map((comment) => (
              <li
                key={comment.id}
                className={[
                  "rounded-2xl border border-slate-700 bg-slate-900/70",
                  comment.text.trim()
                    ? "p-4"
                    : "px-4 py-3",
                ].join(" ")}
              >
                <div
                  className={[
                    "flex flex-wrap items-start justify-between gap-3",
                    comment.text.trim() ? "mb-3" : "",
                  ].join(" ")}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-100">
                        {comment.username}
                      </span>

                      <RatingBadge
                        rating={comment.rating}
                      />
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(
                        comment.created_at,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {comment.text.trim() && (
                  <p className="whitespace-pre-line text-sm leading-6 text-slate-300">
                    {comment.text}
                  </p>
                )}
              </li>
            ))}
          </ul>

          {hiddenReviewsCount > 0 && (
            <button
              type="button"
              onClick={() =>
                setVisibleReviewsCount(
                  (previousCount) =>
                    previousCount +
                    INITIAL_REVIEWS_LIMIT,
                )
              }
              className="mt-4 rounded-full border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              Show {Math.min(
                hiddenReviewsCount,
                INITIAL_REVIEWS_LIMIT,
              )} more{" "}
              {hiddenReviewsCount === 1
                ? "review"
                : "reviews"}
            </button>
          )}
        </div>
      )}
    </section>
  );
};