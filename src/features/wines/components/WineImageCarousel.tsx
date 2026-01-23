import React, { useMemo, useState } from "react";

type WineOffer = {
  shop_name: string;
  shop_url: string;
  price: number;
  image_url?: string | null;
};

type Props = {
  name: string;
  offers: WineOffer[];
  className?: string;
};

const FALLBACK =
  "https://via.placeholder.com/240x360?text=No+Image";

export const WineImageCarousel: React.FC<Props> = ({
  name,
  offers,
  className = "",
}) => {
  const images = useMemo(
    () =>
      Array.from(
        new Set(
          offers
            .map((o) => o.image_url)
            .filter((url): url is string => !!url)
        )
      ),
    [offers]
  );

  const [index, setIndex] = useState(0);
  const [hoverZone, setHoverZone] = useState<"left" | "right" | null>(null);

  if (images.length === 0) {
    return (
      <div
        className={`relative w-full aspect-[2/3] overflow-hidden ${className}`}
      >
        <img
          src={FALLBACK}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const goPrev = () =>
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const goNext = () =>
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      goPrev();
    } else {
      goNext();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const zone =
      x < rect.width / 3
        ? "left"
        : x > (2 * rect.width) / 3
        ? "right"
        : null;
    setHoverZone(zone);
  };

  const handleMouseLeave = () => setHoverZone(null);

  return (
    <div
      className={`relative w-full aspect-[2/3] overflow-hidden cursor-pointer ${className}`}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={images[index]}
        alt={`${name} image ${index + 1} of ${images.length}`}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = FALLBACK;
        }}
      />

      {hoverZone === "left" && images.length > 1 && (
        <button
          type="button"
          className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white text-xl transition hover:bg-black/70 hover:scale-105"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
        >
          ‹
        </button>
      )}

      {hoverZone === "right" && images.length > 1 && (
        <button
          type="button"
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white text-xl transition hover:bg-black/70 hover:scale-105"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
        >
          ›
        </button>
      )}
    </div>
  );
};
