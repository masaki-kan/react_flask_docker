import { TRADE_STATUS } from "../../constants/tradeStatus";

export const statusView = (status: string) => {
  // 大文字・小文字を統一（小文字に変換）
  const normalizedStatus = status.toLowerCase();

  switch (normalizedStatus) {
    case TRADE_STATUS.PENDING:
      return "申請中";
    case TRADE_STATUS.PURCHASED:
      return "選択済";
    case TRADE_STATUS.COMPLETED:
      return "取引完了";
    case TRADE_STATUS.SHIPPED:
      return "発送済み";
    case TRADE_STATUS.CANCELLED:
      return "取引キャンセル";
    case TRADE_STATUS.PRICE_PROPOSED:
      return "金額提案中";
    case TRADE_STATUS.PRICE_AGREED:
      return "金額合意済み";
    case TRADE_STATUS.PAID:
      return "決済済み";
    case TRADE_STATUS.BUYER_RECEIVED:
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
    case TRADE_STATUS.PENDING:
      return [
        {
          color: "yellow",
          status: TRADE_STATUS.SHIPPED,
          text: "発送済み",
        },
        {
          color: "red",
          status: TRADE_STATUS.CANCELLED,
          text: "取引キャンセル",
        },
      ];
    case TRADE_STATUS.SHIPPED:
      return [
        {
          color: "green",
          status: TRADE_STATUS.COMPLETED,
          text: "取引終了",
        },
      ];
    default:
      return [];
  }
};
