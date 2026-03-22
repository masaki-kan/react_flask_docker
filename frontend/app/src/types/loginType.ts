// export interface sinupFormType {
//   username: string;
//   email: string;
//   password: string;
//   plan: string;
//   stripeCustomerId: string;
//   subscriptionId: string;
//   intentId: string;
//   clientSecret: string;
// }

export interface sinupFormType {
  username: string;
  email: string;
  password: string;
  location: string;
  plan: string; // "1": 月額プラン, "2": 年額プラン
  shopName?: string;
  url?: string;
  reason?: string;
  agreeToTerms: boolean; // 利用規約同意フラグ

  // Stripe関連
  clientSecret?: string;
  stripeCustomerId?: string;
  subscriptionId?: string;
  intentId?: string;
  setupIntentId?: string;
  paymentType?: "setup" | "payment";

  // 先着無料トライアル関連
  isEarlyBird?: boolean;
  trialEndDate?: string;
  trialEndFormatted?: string;
}

export interface EarlyBirdStatus {
  earlyBirdAvailable: boolean;
  remaining: number;
  limit: number;
}

export interface errorStateType {
  username: string;
  email: string;
  password: string;
}

export interface plansType {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  save?: string;
  recommended?: boolean;
  badge: string;
  color: string;
  features: string[];
  note?: string;
}
