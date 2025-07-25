export interface profileType {
  id: string;
  image: string;
  name: string;
  location: string;
  old: number;
  age: number;
  tag: { key: string; name: string }[];
  favoriteShop: {
    name: string;
    url: string;
  };
  reasen: string;
  is_following?: boolean;
  likes: number[];
  plan: string;
}

export interface apiRetuenProfileType {
  profile: profileType;
  items: [];
}

export interface profileItemType {
  userId: string;
  title: string;
  description: string;
  images: string[];
  type: string;
  brand: { key: string; name: string };
}

export interface exchangeArchive {
  trade_id: number;
  trade_date: string;
  completed_date: string;
  user_role: "seller" | "buyer";
  // ユーザー情報
  seller_id: number;
  seller_name: string;
  seller_image: string;
  buyer_id: number;
  buyer_name: string;
  buyer_image: string;
  // 商品情報
  main_item_title: string;
  main_item_images: string[];
  seller_item_title: string;
  seller_item_images: string[];
  buyer_item_title: string;
  buyer_item_images: string[];
}
