export const route = {
  top: "/",
  login: "/login",
  singUp: "/singUp",
  tokushoho: "/tokushoho", // 特定商取引法に基づく表記
  privacy: "/privacy", // プライバシーポリシー
  terms: "/terms", // 利用規約

  // 管理者用
  adminLogin: "/admin/login", // 管理者用 ログイン
  adminDashboard: "/admin/dashboard", // 管理者ダッシュボード
  adminUsers: "/admin/users", // ユーザー
  adminUserItem: "admin/users/item", // アイテム
  adminUserTrade: "admin/users/trade", // 取引中一覧
  adminArchive: "admin/users/archive", //取引完了一覧

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
