import type { Wine } from "../types";
import { WineCard } from "./WineCard";

type WineListProps = {
  wines: Wine[];
};


export const WineList = ({ wines }: WineListProps) => {
  if (!wines.length) {
    return <p className="text-gray-500">No wines.</p>;
  }

  return (
    <div className="flex flex-wrap gap-4">
      {wines.map((wine) => (
        <div
          key={wine.id}
          className="w-72 sm:w-80" // card width
        >
          <WineCard wine={wine} />
        </div>
      ))}
    </div>
  );
};