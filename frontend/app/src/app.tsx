import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProfileHome from "./component/profile/home";
import Login from "./component/pages/login";
import { ChakraProvider } from "@chakra-ui/react";
import PublicLayout from "./component/layout/publicLayout";
import SecureLayout from "./component/layout/secureLayout";
import ChatLayout from "./component/layout/chatLayout";
import { route } from "./route/routeConst";
import ListingsHome from "./component/listing/home";
import ShopPageHome from "./component/shop/home";
import BusinessHome from "./component/save/home";
import ItemsHome from "./component/items/home";
import MyItemHome from "./component/myItem/home";
import MyItemEditIndex from "./component/myItemEdit/home";
import ItemDetailHome from "./component/itemDetail/home";
import { Provider } from "react-redux";
import store from "./store";

function App() {
  return (
    <ChakraProvider>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
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
              {/* チャット公開ページ*/}
            </Route>

            <Route path={route.transactionChat} element={<ChatLayout />} />

            <Route path="*" element={<h1>Not Found Page</h1>} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </ChakraProvider>
  );
}

export default App;
