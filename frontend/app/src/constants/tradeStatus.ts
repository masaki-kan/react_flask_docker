/**
 * 取引ステータス定数
 */
export const TRADE_STATUS = {
  PENDING: "pending",
  PRICE_PROPOSED: "price_proposed",
  PRICE_AGREED: "price_agreed",
  PAID: "paid",
  PURCHASED: "purchased",
  SHIPPED: "shipped",
  BUYER_RECEIVED: "buyer_received",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type TradeStatus = (typeof TRADE_STATUS)[keyof typeof TRADE_STATUS];
