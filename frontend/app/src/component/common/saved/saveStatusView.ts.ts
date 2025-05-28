export const statusView = (status: string) => {
  switch (status) {
    case "pending":
      return "取引中";
    case "purchased":
      return "購入済み";
    case "completed":
      return "取引完了";
    case "shipped":
      return "発送済み";
    case "cancelled":
      return "取引キャンセル";
  }
};
