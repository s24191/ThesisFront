import type {
  WineCardWine,
} from "@/features/wines/types";

import {
  WineCard,
} from "./WineCard";

type WineListProps = {
  wines: WineCardWine[];
};

export const WineList = ({
  wines,
}: WineListProps) => {
  if (!wines.length) {
    return (
      <section
        aria-live="polite"
        className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-14 text-center"
      >
        <p className="text-base font-semibold text-slate-200">
          No wines found
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Try clearing a filter or searching with a
          different name, region, or country.
        </p>
      </section>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {wines.map((wine) => (
        <WineCard
          key={wine.id}
          wine={wine}
        />
      ))}
    </div>
  );
};