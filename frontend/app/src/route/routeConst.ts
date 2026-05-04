export const route = {
  top: "/",
  login: "/login",
  signUp: "/signUp",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  tokushoho: "/tokushoho", // 特定商取引法に基づく表記
  privacy: "/privacy", // プライバシーポリシー
  terms: "/terms", // 利用規約

  // 管理者用
  adminLogin: "/admin/login", // 管理者用 ログイン
  adminDashboard: "/admin/dashboard", // 管理者ダッシュボード
  adminUsers: "/admin/users", // ユーザー
  adminUserDetail: "/admin/user/detail", // ユーザー詳細
  adminItems: "/admin/items", // アイテム一覧
  adminItemDetail: "/admin/item/detail", // アイテム詳細
  adminTrades: "/admin/trades", // 取引中一覧
  adminTradeDetail: "/admin/trade/detail", // 取引詳細
  adminUserItem: "/admin/items", // アイテム (後方互換性のため残す)
  adminUserItemDetail: "/admin/item/detail", // アイテム詳細 (後方互換性のため残す)
  adminUserTrade: "/admin/trades", // 取引中一覧 (後方互換性のため残す)
  adminUserTradeDetail: "/admin/trade/detail", // 取引詳細 (後方互換性のため残す)
  adminArchive: "/admin/archives", //取引完了一覧
  adminArchiveDetail: "/admin/archive/detail", //取引完了詳細

  // ユーザー
  users: "/users",
  items: "/items",
  itemDetail: "/user/item",
  saved: "/saved",
  messages: "/messages",
  myItem: "/my_item",
  myItemEdit: "/my_item/edit",
  shopPage: "/shop_page",
  transactionChat: "/transaction/chat",
  favorite: "/favorite",
  approvals: "/approvals",
  profile: "/profile",
  thread: "/thread",
  checkReactivationstatus: "/check_reactivation_status",
};

// パブリックルートのリスト（認証不要）
export const PUBLIC_ROUTES = [
  route.adminLogin,
  route.top,
  route.tokushoho,
  route.privacy,
  route.terms,
  route.forgotPassword,
  route.resetPassword,
];

// 認証が必要なルートのリスト
export const PROTECTED_ROUTES = [
  route.profile,
  route.shopPage,
  route.thread,
  route.users,
  route.items,
  route.itemDetail,
  route.saved,
  route.messages,
  route.myItem,
  route.myItemEdit,
  route.transactionChat,
  route.favorite,
  route.approvals,
  route.checkReactivationstatus,
];
