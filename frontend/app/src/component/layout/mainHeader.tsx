import { type FC } from "react";
import { Box, Image } from "@chakra-ui/react";
import RenderRouteLinks from "../navi/routelinks";

const MainHeader: FC = () => {
  return (
    <Box
      display={{ base: "block", md: "flex" }}
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
      borderBottom="1px"
      borderColor="#f4f2f0"
      px={{ base: 1, md: 10 }}
      py="3"
    >
      <Image src={"/ロゴ.svg"} height="35px" />
      <RenderRouteLinks />
    </Box>
  );
};

export default MainHeader;
