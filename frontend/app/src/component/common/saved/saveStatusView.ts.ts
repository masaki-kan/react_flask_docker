export const statusView = (status: string) => {
  switch (status) {
    case "pending":
      return "取引中";
    // case "purchased":
    //   return "購入済み";
    case "completed":
      return "取引完了";
    case "shipped":
      return "発送済み";
    case "cancelled":
      return "取引キャンセル";
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
          text: "取引完了",
        },
      ];
    default:
      return [];
  }
};
