export interface followListType {
  id: number;
  name: string;
  itemNumber: number;
  icon: string;
}

export interface renderTabPanelType {
  data: followListType[];
}

export interface tagType {
  id: number;
  name: string;
}
