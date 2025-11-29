export interface messagesType {
  avatar: string;
  text: string;
  position: string;
  date: string;
  id: number;
  userId: string | null;
}

export interface chatItemDataType {
  trade_id: string;
  item_id: number;
  title: string;
  description: string;
  type: string;
  brand: { key: string; name: string };
  images: string[];
  user_id: number;
  profile_image: string;
  user_name: string;
  status: string;
  trade_status_flag: number;
  // 購入フロー用のフィールド
  trade_type?: 'exchange' | 'purchase';
  purchase_price?: number;
  is_price_agreed_seller?: boolean;
  is_price_agreed_buyer?: boolean;
  is_buyer_confirmed?: boolean;
}

export interface shippingInfoType {
  user_id: number;
  trade_id: number;
  tracking_number: string;
  shipping_id: number;
  shipping_company: string;
  sender_user_id: string;
  sender_name: string;
  created_at: string;
}

export interface confirmationType {
  user_id: string;
  confirmation_type: "item_received" | "partner_received";
  created_at: string;
}

export interface userDataType {
  age: number;
  location: string;
  name: string;
  old: number;
  profile_image: string;
  reasen: string;
  shop_name: string;
  shop_url: string;
  tags: { key: string; name: string }[];
  user_id: number;
}

export interface ShippingInfo {
  trackingNumber: string;
  shippingCompany: string;
}
