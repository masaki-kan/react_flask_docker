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
}

export interface apiRetuenProfileType {
  profile: profileType;
  items: [];
}
