import { FC } from "react";
import { Outlet } from "react-router-dom";

const PublicLayout: FC = () => {
  return (
    <>
      <main style={{ height: "100vh" }}>
        <Outlet /> {/* ネストされたルートがレンダリングされる場所 */}
      </main>
      {/* <footer>Public Site Footer</footer> */}
    </>
  );
};

export default PublicLayout;
