export interface messagesType {
  avatar: string;
  text: string;
  position: string;
  date: string;
  id: number;
  userId: string | null;
}

export interface chatItemDataType {
  item_id: number;
  title: string;
  description: string;
  price: number;
  curr: string;
  type: string;
  brand: { key: string; name: string };
  images: string[];
  user_id: number;
  profile_image: string;
  seller_name: string;
}
