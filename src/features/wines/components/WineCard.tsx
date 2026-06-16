import type {WineCardWine} from "../types";
import { WineImageCarousel } from "./WineImageCarousel";
import {Link} from "react-router-dom";

type WineCardProps = {
  wine: WineCardWine
};



export const WineCard = ({ wine }: WineCardProps) => {
  const cheapest = wine.best_price;
  const offers = (wine as any).offers ?? [];

  return (
    <div className="flex border border-black rounded-md overflow-hidden bg-white h-full">
      {/* left: placeholder image (no real image from backend yet) */}
      <div className="w-32 sm:w-40">
        <WineImageCarousel wine={wine} />
      </div>


      {/* right: info */}
      <Link to={`/wines/${wine.id}`}
        className="flex-1 p-3 sm:p-4 flex flex-col justify-between hover:bg-slate-50"
      >
        <div className="flex justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-sm sm:text-base text-gray-900">
              {wine.name}
            </span>
            <span className="text-xs sm:text-sm text-gray-700">
              {wine.country}
            </span>
            {wine.region && (
              <span className="text-xs sm:text-sm text-gray-700">
                {wine.region}
              </span>
            )}
          </div>

          <div className="text-right text-gray-900">
            <div className="text-sm sm:text-lg font-semibold leading-none flex items-center justify-end gap-1">
              <span className="text-yellow-500">★</span>
              <span>
                {wine.rating != null ? wine.rating.toFixed(1) : "–"}
              </span>
            </div>
            <div className="text-[10px] sm:text-xs text-gray-600">
              {wine.ratings_count != null
                  ? `${wine.ratings_count} ratings`
                  : "No ratings"}
            </div>
          </div>
        </div>

        <div className="mt-2 space-y-0.5 text-xs sm:text-sm text-gray-900">
          {cheapest != null && (
           <div className="text-gray-800">
            Best price: {cheapest.toFixed(2)} zł
           </div>
          )}
          {offers.length === 0 ? (
            <div className="text-gray-500">No offers available</div>
          ) : (
            offers.map(
              (offer: { shop_name: string; shop_url: string; price: number }) => (
                <div key={`${offer.shop_name}-${offer.shop_url}`}
                     className="flex gap-1 items-center"
                     onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-gray-700">{offer.shop_name}</span>
                  <span>{offer.price.toFixed(2)} zł</span>
                  <a
                    href={offer.shop_url}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto text-[10px] sm:text-xs text-indigo-600 hover:underline"
                  >
                    Go to shop
                  </a>
            </div>
          ),))}
        </div>
      </Link>
    </div>
  );
};
