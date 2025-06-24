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
