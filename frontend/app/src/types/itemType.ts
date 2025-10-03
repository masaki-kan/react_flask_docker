export interface itemListType {
  itemId: string;
  title: string;
  description: string;
  images: string[];
  brand: { key: string; name: string };
  type: string;
  uploaded_at: Date;
  tradeStatusFlag: number;
  uesrname?: string;
  userId?: number;
  profile_image?: string;
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
