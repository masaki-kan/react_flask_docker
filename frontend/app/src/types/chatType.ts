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
  seller_name: string;
  status: string;
}
