import { loadStripe } from "@stripe/stripe-js";

// Stripe公開キー（テスト/本番は環境変数で切り替え）
export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PROMISE_KEY ||
    "pk_test_51RSeMLPtSoh6v635qwxrtEdecuniNskaZuq1ly2DKmB3gYWBGyZke1FnZKluX5rL3ux0trPXKvIFUWi3JEAaU0FA00OratpnfV"
);
