export interface itemListType {
  title: string;
  price: number;
  currency: string;
  description: string;
  type: { key: string; name: string };
  brand: { key: string; name: string };
  image: string[];
}

export interface itemDetailType {
  title: string;
  price: number;
  description: string;
  type: { key: string; name: string };
  brand: { key: string; name: string };
  image: string[];
}
