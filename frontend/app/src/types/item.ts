export interface itemListType {
  itemName: string;
  price: number;
  currency: string;
  description: string;
  type: { typeKey: number; typeName: string };
  brand: { brandKey: number; brandName: string };
  image: string;
}
