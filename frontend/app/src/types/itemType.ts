export interface itemListType {
  itemId: string;
  title: string;
  description: string;
  type: string;
  brand: { key: string; name: string };
  images: string[];
  uploaded_at: Date;
  profile_image: string;
  user_id: number;
  user_name: string;
  likes?: number[];
  tradeStatusFlag: number;
  tradeApprovalsFlag?: number;
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
