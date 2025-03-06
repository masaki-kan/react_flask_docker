import { FC, useState } from "react";
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
} from "@chakra-ui/react";
import { GiHamburgerMenu } from "react-icons/gi";
import { CiCircleList, CiHeart } from "react-icons/ci";
import { AiOutlineMessage, AiOutlineUser } from "react-icons/ai";
import { TbCreditCardPay } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { sideMenuType } from "../../types/sideType";
import { route } from "../../route/routeConst";
import { useNavigate } from "react-router-dom";

const Side: FC = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [menuList, setMenuList] = useState<sideMenuType[]>([
    {
      text: "Listings",
      icon: CiCircleList,
      route: route.listings,
    },
    {
      text: "Saved",
      icon: CiHeart,
      route: route.saved,
    },
    {
      text: "Messages",
      icon: AiOutlineMessage,
      route: route.messages,
    },
    {
      text: "Purchases",
      icon: TbCreditCardPay,
      route: route.purchases,
    },
    {
      text: "Profile",
      icon: AiOutlineUser,
      route: route.profile,
    },
  ]);

  const [footerMenu, setFooterMenu] = useState<sideMenuType[]>([
    {
      text: "Setting",
      icon: IoSettingsOutline,
      route: "",
    },
    {
      text: "Help & Support",
      icon: IoMdHelpCircleOutline,
      route: "",
    },
  ]);

  // 遷移関数
  const routePushHandler = (routePath: string): void => {
    navigate(routePath);
  };

  return (
    <>
      <Box
        position={"fixed"}
        onClick={onOpen}
        marginLeft={{ base: 4, md: 10 }}
        marginTop={{ base: 2, md: 2 }}
      >
        <GiHamburgerMenu size={30} />
      </Box>

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
            {menuList.map((menu, index) => {
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
