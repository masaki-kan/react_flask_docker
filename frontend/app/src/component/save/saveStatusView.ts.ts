export const statusView = (status: string) => {
  switch (status) {
    case "pending":
      return "取引中";
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
      return "金額合意済";
    case "paid":
      return "決済完了";
    case "buyer_received":
      return "受取確認済";
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
