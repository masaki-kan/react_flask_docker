import {
  AccessorKeyColumnDefBase,
  createColumnHelper,
  IdIdentifier,
} from "@tanstack/react-table";
import { UsersDataType, columnHelperItemsType } from "../../types/adminTypes";

export const columnHelper = createColumnHelper<UsersDataType>();

export const columnUsersHelper = (
  items: columnHelperItemsType[]
): (
  | (AccessorKeyColumnDefBase<UsersDataType, number> &
      Partial<IdIdentifier<UsersDataType, number>>)
  | (AccessorKeyColumnDefBase<UsersDataType, string> &
      Partial<IdIdentifier<UsersDataType, string>>)
)[] => {
  const colums = items.map((item) => {
    return columnHelper.accessor(item.key, {
      header: item.header,
      cell: (info) => cellCheckHandler(item.key, info.getValue()),
    });
  });

  return colums;
};

export const cellCheckHandler = (
  key: string,
  value: string | number
): string | number => {
  if (key === "plan") {
    return value === "1" ? "年払 9900円" : "月額 990円(初月無料 )";
  }

  if (key === "is_deleted") {
    return value === "1" ? "退会済" : "利用中";
  }
  if (key === "created_at" || key === "updated_at") {
    return new Date(value).toLocaleString("ja-JP");
  }

  return value;
};
