import { type FC } from "react";
import { Box, Image, useColorModeValue } from "@chakra-ui/react";

const MainAdminHeader: FC = () => {
  // カラーモード対応
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const shadowColor = useColorModeValue(
    "0 2px 12px rgba(0, 0, 0, 0.08)",
    "0 2px 12px rgba(0, 0, 0, 0.3)"
  );

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
      <Box
        as="nav"
        position="sticky"
        top={0}
        zIndex={1000}
        bg={bgColor}
        borderBottom="1px solid"
        borderColor={borderColor}
        boxShadow={shadowColor}
      ></Box>
    </Box>
  );
};

export default MainAdminHeader;
