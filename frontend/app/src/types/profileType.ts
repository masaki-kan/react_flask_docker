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
  type: number;
  is_deleted: number;
  deleted_at: Date | null;
  email: string;
  stripe_account_id?: string;
  stripe_onboarding_completed?: boolean;
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

export interface profileResponse {
  success: boolean;
  data: {
    message: string;
    status: boolean;
  };
}
