import { FC, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import AuthProvider from "../provider/authProvider";
import ChatHome from "../component/chat/home";
import PublicLayout from "../component/layout/publicLayout";
import SecureLayout from "../component/layout/secureLayout";
import Login from "../component/pages/login";
import Launch from "../component/launch/home";
import { route } from "./routeConst";
import ListingsHome from "../component/listing/home";
import ShopPageHome from "../component/shop/home";
import BusinessHome from "../component/save/home";
import ItemsHome from "../component/items/home";
import MyItemHome from "../component/myItem/home";
import MyItemEditIndex from "../component/myItemEdit/home";
import ItemDetailHome from "../component/itemDetail/home";
import ProfileHome from "../component/profile/home";
import FavoriteHome from "../component/favorite/home";
import { useDispatch } from "react-redux";
import { setPreviousUrl } from "../store/navigationSlice";

const AppRoutes: FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    // pathname 変更のたびに保存（初回除くなら条件追加）
    dispatch(setPreviousUrl(location.pathname));
  }, [dispatch, location.pathname]);

  return (
    <>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path={route.launch} element={<Launch />} />
            <Route path={route.login} element={<Login />} />
            {/* 他の公開ページもここに追加できます */}
          </Route>

          <Route element={<SecureLayout />}>
            <Route path={route.home} element={<ProfileHome />} />
            <Route path={route.users} element={<ListingsHome />} />
            <Route path={route.items} element={<ItemsHome />} />
            <Route path={route.shopPage} element={<ShopPageHome />} />
            <Route path={route.saved} element={<BusinessHome />} />
            <Route path={route.myItem} element={<MyItemHome />} />
            <Route path={route.myItemEdit} element={<MyItemEditIndex />} />
            <Route path={route.itemDetail} element={<ItemDetailHome />} />
            <Route path={route.favorite} element={<FavoriteHome />} />
            <Route path={route.transactionChat} element={<ChatHome />} />
          </Route>
          <Route path="*" element={<h1>Not Found Page</h1>} />
        </Routes>
      </AuthProvider>
    </>
  );
};

export default AppRoutes;
