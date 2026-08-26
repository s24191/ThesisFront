import type {RatingBucket} from "@/features/wines/types/rating.ts";

type WineRatingSummaryProps = {
  buckets: RatingBucket[];
};

export const WineRatingSummary = ({
  buckets,
}: WineRatingSummaryProps) => {
  if (!buckets.length) {
    return null;
  }

  const total = buckets.reduce(
    (sum, bucket) => sum + bucket.count,
    0,
  );

  if (total === 0) {
    return null;
  }

  const weightedRatingTotal = buckets.reduce(
    (sum, bucket) =>
      sum + bucket.rating * bucket.count,
    0,
  );

  const averageRating =
    weightedRatingTotal / total;

  const maxCount = Math.max(
    ...buckets.map((bucket) => bucket.count),
    1,
  );

  const sortedBuckets = [...buckets].sort(
    (firstBucket, secondBucket) =>
      secondBucket.rating - firstBucket.rating,
  );

  return (
    <section
      aria-labelledby="wine-rating-summary-title"
      className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/70 p-4 shadow-sm"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-2xl font-bold text-amber-300">
            <span aria-hidden="true">
              ★
            </span>

            <span>
              {averageRating.toFixed(2)}
            </span>
          </div>

          <div
            aria-hidden="true"
            className="h-7 w-px bg-slate-700"
          />

          <div>
            <h2
              id="wine-rating-summary-title"
              className="text-sm font-semibold text-slate-100"
            >
              Community rating
            </h2>

            <p className="text-xs text-slate-500">
              {total}{" "}
              {total === 1
                ? "rating"
                : "ratings"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        {sortedBuckets.map((bucket) => {
          const relativeWidth =
            (bucket.count / maxCount) * 100;

          const percentage =
            (bucket.count / total) * 100;

          return (
            <div
              key={bucket.rating}
              className="grid grid-cols-[40px_minmax(0,1fr)_58px] items-center gap-2.5"
            >
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-300">
                <span
                  aria-hidden="true"
                  className="text-amber-400"
                >
                  ★
                </span>

                <span>
                  {bucket.rating}
                </span>
              </div>

              <div
                role="progressbar"
                aria-label={`${bucket.rating} out of 10 ratings`}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={bucket.count}
                aria-valuetext={`${bucket.count} of ${total} ratings gave ${bucket.rating} out of 10`}
                className="h-2 overflow-hidden rounded-full bg-slate-800"
              >
                <div
                  aria-hidden="true"
                  className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-300 transition-all duration-300"
                  style={{
                    width: `${relativeWidth}%`,
                  }}
                />
              </div>

              <div className="text-right text-xs">
                <span className="font-semibold text-slate-200">
                  {bucket.count}
                </span>

                <span className="ml-1 text-slate-500">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};