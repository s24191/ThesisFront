import React from "react";

type Bucket = { rating: number; count: number };

type Props = {
  buckets: Bucket[];
};
export const WineRatingSummary: React.FC<Props> = ({ buckets }) => {
  if (!buckets.length) return null;

  const total = buckets.reduce((acc: any, b: { count: any; }) => acc + b.count, 0);
  const avg =
    buckets.reduce((acc: number, b: { rating: number; count: number; }) => acc + b.rating * b.count, 0) /
    (total || 1);
  const maxCount = Math.max(...buckets.map((b: { count: any; }) => b.count));


    return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold mb-2">Community rating</h2>
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-3xl font-bold">{avg.toFixed(1)}</span>
        <span className="text-xs text-gray-600">
          based on {total} {total === 1 ? "review" : "reviews"}
        </span>
      </div>

      <div className="space-y-1">
        {buckets
          .slice()
          .sort((a: { rating: number; }, b: { rating: number; }) => b.rating - a.rating)
          // @ts-ignore
          .map(({ rating, count }) => {
            const pct = maxCount ? (count / maxCount) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-2 text-xs">
                <span className="w-4 text-right">{rating}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded">
                  <div
                    className="h-2 rounded bg-red-900"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-gray-600">
                  {count}
                </span>
              </div>
            );
          })}
      </div>
    </section>
  );
};