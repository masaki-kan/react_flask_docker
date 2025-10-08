import { useCallback, type FC } from "react";
import { Box, Button, Image } from "@chakra-ui/react";
import { useAuth } from "../../provider/authContext";

const MainAdminHeader: FC = () => {
  const { adminLogout } = useAuth();
  const logOutHandler = useCallback(() => {
    adminLogout();
  }, [adminLogout]);

  return (
    <Box
      display={"flex"}
      position="fixed"
      w="100%"
      zIndex="sticky"
      top={0}
      background={"white"}
      width={"full"}
      alignItems="center"
      gap="8"
      justifyContent={"space-between"}
      as="header"
      px={{ base: 1, md: 10 }}
      py="3"
    >
      <Image src={"/ロゴ.svg"} height="35px" />
      <Button onClick={logOutHandler} size={"sm"}>
        ログアウト
      </Button>
    </Box>
  );
};

export default MainAdminHeader;
