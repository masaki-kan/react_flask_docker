import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProfileHome from "./component/profile/home";
import Login from "./component/pages/login";
import { ChakraProvider } from "@chakra-ui/react";
import PublicLayout from "./component/layout/publicLayout";
import SecureLayout from "./component/layout/secureLayout";
import { route } from "./route/routeConst";
import ListingsHome from "./component/listing/home";

function App() {
  return (
    <>
      <ChakraProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path={route.login} element={<Login />} />
              {/* 他の公開ページもここに追加できます */}
            </Route>

            <Route element={<SecureLayout />}>
              <Route path={route.home} element={<ProfileHome />} />
              <Route path={route.listings} element={<ListingsHome />} />
              {/* 他の公開ページもここに追加できます */}
            </Route>
            <Route path="*" element={<h1>Not Found Page</h1>} />
          </Routes>
        </BrowserRouter>
      </ChakraProvider>
    </>
  );
}

export default App;
