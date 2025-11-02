import { createColumnHelper } from "@tanstack/react-table";
import { ItemsDataType, columnHelperItemsType } from "../../types/adminTypes";

export const columnHelper = createColumnHelper<ItemsDataType>();

export const columnItemsHelper = (items: columnHelperItemsType[]) => {
  const columns = items.map((item) => {
    return columnHelper.accessor(item.key as keyof ItemsDataType, {
      header: item.header,
      cell: (info) => cellCheckHandler(item.key, info.getValue() as string | number),
    });
  });

  return columns;
};

export const cellCheckHandler = (
  key: string,
  value: string | number
): string | number => {
  if (key === "uploaded_at") {
    return new Date(value).toLocaleString("ja-JP");
  }

  if (key === "type" || key === "brand") {
    try {
      const parsed = JSON.parse(value as string);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => item.name || item).join(", ");
      }
      return parsed.name || value;
    } catch {
      return value;
    }
  }

  if (key === "status") {
    const statusMap: { [key: string]: string } = {
      available: "販売中",
      trading: "取引中",
      exchanged: "取引完了",
    };
    return statusMap[value as string] || value;
  }

  return value;
};
