import type {WineFilters,} from "@/features/wines/types";

export type SortKey =
  | "year"
  | "alcohol"
  | "volume"
  | "comments"
  | "rating"
  | "body"
  | "tannin"
  | "sweetness"
  | "acidity"
  | "price";

export type SortDir =
  | "asc"
  | "desc";

export type ActiveSort = {
  key: SortKey;
  dir: SortDir;
};

export const SORT_CONFIG: Record<
  SortKey,
  {
    label: string;
    defaultDir: SortDir;
  }
> = {
  year: {
    label: "Year",
    defaultDir: "desc",
  },

  alcohol: {
    label: "Alcohol",
    defaultDir: "desc",
  },

  volume: {
    label: "Volume",
    defaultDir: "asc",
  },

  comments: {
    label: "Comments",
    defaultDir: "desc",
  },

  rating: {
    label: "Rating",
    defaultDir: "desc",
  },

  body: {
    label: "Body",
    defaultDir: "desc",
  },

  tannin: {
    label: "Tannin",
    defaultDir: "desc",
  },

  sweetness: {
    label: "Sweetness",
    defaultDir: "desc",
  },

  acidity: {
    label: "Acidity",
    defaultDir: "desc",
  },

  price: {
    label: "Price",
    defaultDir: "asc",
  },
};

export const SORT_KEYS = Object.keys(
  SORT_CONFIG,
) as SortKey[];

const isSortKey = (
  value: string,
): value is SortKey =>
  SORT_KEYS.includes(
    value as SortKey,
  );

export const parseSorts = (
  sort: WineFilters["sort"] | undefined,
): ActiveSort[] => {
  if (!sort) {
    return [];
  }

  return sort
    .split(",")
    .map((entry) => {
      const [rawKey, rawDir] =
        entry.trim().split("-");

      if (
        !isSortKey(rawKey) ||
        (rawDir !== "asc" && rawDir !== "desc")
      ) {
        return null;
      }

      return {
        key: rawKey,
        dir: rawDir,
      };
    })
    .filter(
      (
        item,
      ): item is ActiveSort =>
        item !== null,
    );
};

export const encodeSorts = (
  sorts: ActiveSort[],
): string | undefined => {
  if (!sorts.length) {
    return undefined;
  }

  return sorts
    .map(
      ({ key, dir }) =>
        `${key}-${dir}`,
    )
    .join(",");
};