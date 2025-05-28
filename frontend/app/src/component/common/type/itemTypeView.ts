import { itemParts } from "../../../consts/itemConsts";

export const itemTypeViewHanlder = (key: string): string => {
  const type = itemParts.filter((type) => type.key === Number(key));

  return type[0].name;
};
