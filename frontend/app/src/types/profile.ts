export interface profileType {
  image: string;
  name: string;
  location: string;
  old: number;
  age: number;
  tag: { tagKey: string; tagName: string }[];
  favoriteShop: {
    name: string;
    url: string;
  };
  reasen: string;
}
