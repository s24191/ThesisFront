export type WineOffer = {
  shop_name: string;
  shop_url: string;
  price: number | string;
  image_url?: string | null;
};

export type WineCardOffer = {
  shop_name: string;
  shop_url: string;
  price: number | string;
  image_url: string | null;
};