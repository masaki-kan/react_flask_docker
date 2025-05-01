import { FC } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Box,
  DrawerHeader,
  Text,
  HStack,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { GiHamburgerMenu } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { menuLists, footerMenu } from "../../../consts/menuList";

const Side: FC = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // 遷移関数
  const routePushHandler = (routePath: string): void => {
    navigate(routePath);
    onClose();
  };

  return (
    <>
      {/* <Box
        position="fixed"
        top={{ md: "6em" }}
        onClick={onOpen}
        marginLeft={{ base: 4, md: 10 }}
        marginTop={{ base: 2, md: 2 }}
      >
        <Icon
          as={GiHamburgerMenu}
          boxSize={6}
          display={{ base: "none", md: "block" }}
        />
      </Box> */}

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottom={"1px solid #ccc"}>
            <Text>Profile</Text>
            <Text size={"sm"} color={"#887563"}>
              @vintage_Threads
            </Text>
          </DrawerHeader>
          <DrawerBody>
            {menuLists.map((menu, index) => {
              return (
                <HStack
                  _hover={{
                    bgColor: "#f4f2f0",
                    transition: "background-color 0.3s ease",
                  }}
                  w={"full"}
                  p={3}
                  key={index}
                  onClick={() => routePushHandler(menu.route)}
                  cursor={"pointer"}
                >
                  <menu.icon />
                  <Text color="#181411" fontSize="sm" fontWeight="medium">
                    {menu.text}
                  </Text>
                </HStack>
              );
            })}
          </DrawerBody>

          <DrawerFooter display={"block"}>
            <VStack>
              {footerMenu.map((menu, index) => {
                return (
                  <HStack
                    w={"full"}
                    p={3}
                    key={index}
                    onClick={() => routePushHandler(menu.route)}
                    cursor={"pointer"}
                  >
                    <menu.icon />
                    <Text color="#181411" fontSize="sm" fontWeight="medium">
                      {menu.text}
                    </Text>
                  </HStack>
                );
              })}
            </VStack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Side;
