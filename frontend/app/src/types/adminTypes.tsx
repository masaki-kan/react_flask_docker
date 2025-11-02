export interface UsersDataType {
  user_id: number;
  name: string;
  email: string;
  plan: string;
  item_count: number;
  is_deleted: number;
  created_at: string;
  updated_at: string;
}

export interface ItemsDataType {
  item_id: number;
  user_id: number;
  user_name: string;
  title: string;
  type: string;
  brand: string;
  uploaded_at: string;
  status: string;
}

export interface columnHelperItemsType {
  key:
    | "user_id"
    | "name"
    | "email"
    | "plan"
    | "item_count"
    | "is_deleted"
    | "created_at"
    | "updated_at"
    | "item_id"
    | "user_name"
    | "title"
    | "type"
    | "brand"
    | "uploaded_at"
    | "status"
    | "actions";
  header: string;
}
