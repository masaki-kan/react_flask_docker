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

const AppRoutes: FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    // pathname 変更のたびに保存（初回除くなら条件追加）
    dispatch(setPreviousUrl(location.pathname));
  }, [dispatch, location.pathname]);

  return (
    // AuthProviderでアプリ全体をラップ
    <AuthProvider>
      <Routes>
        {/* パブリックルート */}
        <Route element={<PublicLayout />}>
          <Route path={route.top} element={<Top />} />
          <Route path={route.login} element={<Login />} />
          <Route path={route.singUp} element={<SingUp />} />
          <Route path={route.tokushoho} element={<TokushohoPage />} />
          {/* 他の公開ページもここに追加できます */}
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
        <Route path="*" element={<h1>Not Found Page</h1>} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;
