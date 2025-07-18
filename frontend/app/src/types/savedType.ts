export interface savedListType {
  image_url: string;
  status: string;
  title: string;
  trade_created_at: Date;
  trade_id: number;
  user_image_url: string;
  user_name: string;
  user_id: number;
  type: string;
  brand: { key: string; name: string };
  last_message_time: string;
  buyer_id: string;
  seller_id: string;
}
