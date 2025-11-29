import { FC, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import AuthProvider from "../provider/authProvider";
import ChatHome from "../component/chat/home";
import PublicLayout from "../component/layout/publicLayout";
import SecureLayout from "../component/layout/secureLayout";
import Top from "../component/pages/login";
import { route } from "./routeConst";
import ListingsHome from "../component/listing/home";
import ShopPageHome from "../component/shop/home";
import BusinessHome from "../component/save/savedIndex";
import ItemsHome from "../component/items/home";
import MyItemHome from "../component/myItem/home";
import MyItemEditIndex from "../component/myItemEdit/home";
import ItemDetailHome from "../component/itemDetail/home";
import ProfileHome from "../component/profile/home";
import FavoriteHome from "../component/favorite/home";
import { useDispatch } from "react-redux";
import { setPreviousUrl } from "../store/navigationSlice";
import ThreadPage from "../component/thread/threadPage";
import TokushohoPage from "../component/tokushoho/tokushohoPage";
import Login from "../component/login/loginForm";
import SingUp from "../component/sinUp/singUpForm";
import { useAuth } from "../provider/authContext";
import CheckReactivationstatus from "../component/checkReactivationstatus/checkReactivationstatus";
import AdminLogin from "../component/admin/auth/adminLogin";
import AdminDashboard from "../component/admin/dashboard/Dashboard";
import SecureAdminLayout from "../component/layout/secureAdminLayout";
import NotFound from "../component/pages/notFound";
import PrivacyPolicy from "../component/privacy/privacyPolicy";
import RiyouKiyakuPage from "../component/riyoukiyaku/riyouKiyakuPage";
import AdminUsers from "../component/admin/user/adminUsers";
import AdminUserDetail from "../component/admin/user/adminUserDetail";
import AdminItems from "../component/admin/item/adminItems";
import AdminItemDetail from "../component/admin/item/adminItemDetail";
import AdminTrades from "../component/admin/trade/adminTrades";
import AdminTradeDetail from "../component/admin/trade/adminTradeDetail";
import AdminArchives from "../component/admin/trade/adminArchives";
import AdminArchiveDetail from "../component/admin/trade/adminArchiveDetail";

// 認証が必要なルートのラッパーコンポーネント
const ProtectedLayout = () => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  // 未ログインの場合はログインページへリダイレクト
  if (!isLoggedIn) {
    return <Navigate to={route.login} state={{ from: location }} replace />;
  }

  return <SecureLayout />;
};

// 管理者用 認証が必要なルートのラッパーコンポーネント
const AdminProtectedLayout = () => {
  const { isAdminLoggedIn } = useAuth();
  const location = useLocation();

  // 未ログインの場合はログインページへリダイレクト
  if (!isAdminLoggedIn) {
    return (
      <Navigate to={route.adminLogin} state={{ from: location }} replace />
    );
  }

  return <SecureAdminLayout />;
};

const AppRoutes: FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    // pathname 変更のたびに保存（初回除くなら条件追加）
    dispatch(setPreviousUrl(location.pathname));

    // ページトップにスクロール（より確実に）
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    // documentElementとbodyの両方をリセット
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [dispatch, location.pathname]);

  return (
    // AuthProviderでアプリ全体をラップ
    <AuthProvider>
      <Routes>
        {/* パブリックルート */}
        <Route element={<PublicLayout />}>
          <Route path={route.adminLogin} element={<AdminLogin />} />
          <Route path={route.top} element={<Top />} />
          <Route path={route.login} element={<Login />} />
          <Route path={route.signUp} element={<SingUp />} />
          <Route path={route.tokushoho} element={<TokushohoPage />} />
          <Route path={route.terms} element={<RiyouKiyakuPage />} />
          <Route path={route.privacy} element={<PrivacyPolicy />} />
        </Route>

        {/** 管理者用認証ルート */}
        <Route element={<AdminProtectedLayout />}>
          <Route path={route.adminDashboard} element={<AdminDashboard />} />
          <Route path={route.adminUsers} element={<AdminUsers />} />
          <Route path={route.adminUserDetail} element={<AdminUserDetail />} />
          <Route path={route.adminUserItem} element={<AdminItems />} />
          <Route path={route.adminItemDetail} element={<AdminItemDetail />} />
          <Route path={route.adminTrades} element={<AdminTrades />} />
          <Route path={route.adminTradeDetail} element={<AdminTradeDetail />} />
          <Route path={route.adminArchive} element={<AdminArchives />} />
          <Route path={route.adminArchiveDetail} element={<AdminArchiveDetail />} />
        </Route>

        {/* 認証が必要なルート（プロテクテッドルート） */}
        <Route element={<ProtectedLayout />}>
          <Route path={route.profile} element={<ProfileHome />} />
          <Route path={route.users} element={<ListingsHome />} />
          <Route path={route.items} element={<ItemsHome />} />
          <Route path={route.shopPage} element={<ShopPageHome />} />
          <Route path={route.saved} element={<BusinessHome />} />
          <Route path={route.myItem} element={<MyItemHome />} />
          <Route path={route.myItemEdit} element={<MyItemEditIndex />} />
          <Route path={route.itemDetail} element={<ItemDetailHome />} />
          <Route path={route.favorite} element={<FavoriteHome />} />
          <Route path={route.transactionChat} element={<ChatHome />} />
          <Route path={route.thread} element={<ThreadPage />} />
          <Route
            path={route.checkReactivationstatus}
            element={<CheckReactivationstatus />}
          />
        </Route>

        {/* 404ページ */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;
