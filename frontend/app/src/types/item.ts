export interface itemListType {
  itemId: string;
  title: string;
  price: number;
  curr: string;
  description: string;
  type: string;
  brand: { key: string; name: string };
  images: string[];
  uploaded_at: Date;
  profile_image: string;
}

export interface itemDetailType {
  itemId: number;
  title: string;
  price: number;
  description: string;
  type: string;
  brand: { key: string; name: string };
  images: string[];
}
