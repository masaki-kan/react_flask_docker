export interface tradeApprovalListType {
  approval_id: number;
  created_at: string;
  item: {
    description: string;
    image: string;
    title: string;
  };
  item_id: number;
  status: number;
  status_text: string;
  time_ago: string;
  type: string;
  target_user: { id: number; image: string; name: string };
}
