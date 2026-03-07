export const statusView = (status: string) => {
  // 大文字・小文字を統一（小文字に変換）
  const normalizedStatus = status.toLowerCase();

  switch (normalizedStatus) {
    case "pending":
      return "申請中";
    case "purchased":
      return "選択済";
    case "completed":
      return "取引完了";
    case "shipped":
      return "発送済み";
    case "cancelled":
      return "取引キャンセル";
    case "price_proposed":
      return "金額提案中";
    case "price_agreed":
      return "金額合意済み";
    case "paid":
      return "決済済み";
    case "buyer_received":
      return "受取確認済み";
    case "awaiting_payment":
      return "入金待ち";
    default:
      return status;
  }
};

export const chatDetailTradeStatus = (
  status: string
): {
  color: string;
  status: string;
  text: string;
}[] => {
  switch (status) {
    case "pending":
      return [
        {
          color: "yellow",
          status: "shipped",
          text: "発送済み",
        },
        {
          color: "red",
          status: "cancelled",
          text: "取引キャンセル",
        },
      ];
    case "shipped":
      return [
        {
          color: "green",
          status: "completed",
          text: "取引終了",
        },
      ];
    default:
      return [];
  }
};
