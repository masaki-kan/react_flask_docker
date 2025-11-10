import { brandList } from "../../../consts/brandListi";
import { itemParts } from "../../../consts/itemConsts";

export const formatType = (typeString: string) => {
  const parsed = JSON.parse(typeString);
  if (typeString === "") return "設定なし";
  return itemParts.map((list: { key: number; name: string }) => {
    if (Number(parsed) === list.key) {
      return list.name;
    }
  });
};

export const formatBrand = (brandString: string) => {
  const parsed = JSON.parse(brandString);
  // 配列の場合は各要素のnameを結合
  if (parsed.key === "" && parsed.name === "") return "設定なし";
  return brandList.map((list: { key: number; name: string }) => {
    if (parsed.key === list.key) {
      return list.name;
    }
  });
};
