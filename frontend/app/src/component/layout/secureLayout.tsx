import { FC } from "react";
import MainHeader from "../common/mainHeader";
import Side from "../common/side";
import { Outlet } from "react-router-dom";
import { Box } from "@chakra-ui/react";

const SecureLayout: FC = () => {
  return (
    <>
      <MainHeader />
      <Side />
      <main>
        <Box mt={{ base: "7em", md: 24 }}>
          <Outlet />
        </Box>
      </main>
    </>
  );
};

export default SecureLayout;
