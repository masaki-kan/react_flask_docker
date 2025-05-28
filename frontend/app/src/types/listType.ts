export interface followListType {
  age: number;
  image_url: string;
  location: string;
  name: string;
  uploaded_at: string;
  user_id: number;
  item_count: number;
  is_followed: number;
  is_following: number;
  tags: tagType[];
}

export interface renderTabPanelType {
  data: followListType[];
}

export interface tagType {
  key: number;
  name: string;
}
