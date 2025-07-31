import { FC, useMemo, useCallback, useEffect, useState } from "react";
import {
  Box,
  Container,
  HStack,
  Avatar,
  Text,
  Button,
  useColorModeValue,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Flex,
  Badge,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { route } from "../../../route/routeConst";
import { useNavigate, useLocation } from "react-router-dom";
import { menuLists } from "../../../consts/menuList";
import useMyProfile from "../../../hooks/useProfile";
import useSaved from "../../../hooks/useSaved";
import {
  FaUserCircle,
  FaBars,
  FaSignOutAlt,
  FaCog,
  FaUser,
} from "react-icons/fa";
import { useEffectOnce } from "react-use";

const RenderRouteLinks: FC = () => {
  const { memorizeProfile } = useMyProfile();
  const profile = useMemo(() => memorizeProfile, [memorizeProfile]);
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { savedList, getSavedListHandler } = useSaved();
  const [readSaveStatus, setReadSaveStatus] = useState<boolean>(false);

  // カラーモード対応
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const activeColor = useColorModeValue("blue.500", "blue.400");
  const shadowColor = useColorModeValue(
    "0 2px 12px rgba(0, 0, 0, 0.08)",
    "0 2px 12px rgba(0, 0, 0, 0.3)"
  );

  const MotionBox = motion(Box);

  const readSaveTimestamps = useCallback(() => {
    const stored = localStorage.getItem("readSaveTimestamps");
    try {
      return stored ? JSON.parse(stored) : {};
    } catch {
      localStorage.removeItem("readSaveTimestamps");
      return {};
    }
  }, []);

  const unCompletedList = useMemo(() => {
    return savedList
      .filter((list) => list.status !== "completed")
      .map((list) => list);
  }, [savedList]);

  useEffect(() => {
    const newArray: { tradeId: number; isNew: boolean }[] = [];
    unCompletedList.forEach((save) => {
      const tradeKey: string = save.trade_id.toString();
      const lastRead = readSaveTimestamps()[tradeKey];
      const isNew =
        !lastRead || new Date(save.last_message_time) > new Date(lastRead);
      newArray.push({ tradeId: save.trade_id, isNew });
    });

    const isNew = newArray.find((item) => item.isNew === true)?.isNew ?? false;
    setReadSaveStatus(isNew);
  }, [readSaveTimestamps, savedList, unCompletedList]);

  useEffectOnce(() => {
    getSavedListHandler();
  });

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={1000}
      bg={bgColor}
      borderBottom="1px solid"
      borderColor={borderColor}
      boxShadow={shadowColor}
    >
      <Container maxW="container.xl" py={3}>
        <Flex justify="space-between" align="center">
          {/* ロゴ */}
          <HStack spacing={4}>
            <HStack
              onClick={() => navigate(route.home)}
              cursor="pointer"
              spacing={3}
              _hover={{ opacity: 0.8 }}
              transition="all 0.2s"
            >
              <Box bg="gray.900" p={2} borderRadius="lg" boxShadow="md">
                <Icon viewBox="0 0 24 24" boxSize={6} color="white">
                  <path
                    fill="currentColor"
                    d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
                  />
                </Icon>
              </Box>
              <Text
                fontSize="lg"
                fontWeight="bold"
                display={{ base: "none", md: "block" }}
              >
                僕らのヴィンテージ
              </Text>
            </HStack>
          </HStack>

          {/* デスクトップナビゲーション */}
          <HStack spacing={1} display={{ base: "none", md: "flex" }}>
            {menuLists.map((menu, index) => {
              const isActive = location.pathname === menu.route;
              const hasNotification =
                menu.route === route.saved && readSaveStatus;

              return (
                <Box key={index} position="relative">
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => handleNavigation(menu.route)}
                    bg={isActive ? activeColor : "transparent"}
                    color={isActive ? "white" : textColor}
                    _hover={{
                      bg: isActive ? activeColor : hoverBg,
                    }}
                    fontWeight={isActive ? "bold" : "medium"}
                    px={6}
                  >
                    {menu.text}
                  </Button>
                  {hasNotification && (
                    <MotionBox
                      position="absolute"
                      top={1}
                      right={1}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <Box
                        bg="red.500"
                        borderRadius="full"
                        w={2}
                        h={2}
                        border="2px solid"
                        borderColor={bgColor}
                      />
                    </MotionBox>
                  )}
                </Box>
              );
            })}
          </HStack>

          {/* プロフィールメニュー */}
          <HStack spacing={4}>
            {/* モバイルメニューボタン */}
            <IconButton
              aria-label="Menu"
              icon={<FaBars />}
              variant="ghost"
              display={{ base: "flex", md: "none" }}
              onClick={onOpen}
            />

            {/* アバターメニュー */}
            <Menu>
              <MenuButton
                as={Box}
                cursor="pointer"
                borderRadius="full"
                _hover={{
                  transform: "scale(1.05)",
                }}
                transition="all 0.2s"
              >
                {profile.profile.image.length > 0 ? (
                  <Avatar
                    size="md"
                    src={profile.profile.image}
                    name={profile.profile.name}
                    border="2px solid"
                    borderColor="transparent"
                    _hover={{
                      borderColor: activeColor,
                    }}
                  />
                ) : (
                  <Box
                    p={2}
                    borderRadius="full"
                    bg={hoverBg}
                    _hover={{
                      bg: activeColor,
                      color: "white",
                    }}
                    transition="all 0.2s"
                  >
                    <Icon as={FaUserCircle} boxSize={7} />
                  </Box>
                )}
              </MenuButton>
              <MenuList
                bg={bgColor}
                borderColor={borderColor}
                boxShadow="lg"
                py={2}
                minW="250px"
              >
                <Box px={4} py={3}>
                  <Text fontWeight="bold" fontSize="md">
                    {profile.profile.name}
                  </Text>
                </Box>
                <MenuDivider />
                <MenuItem
                  icon={<FaUser />}
                  onClick={() => navigate(route.profile)}
                  _hover={{ bg: hoverBg }}
                  py={3}
                >
                  マイプロフィール
                </MenuItem>
                <MenuItem
                  icon={<FaCog />}
                  onClick={() => navigate(route.home)}
                  _hover={{ bg: hoverBg }}
                  py={3}
                >
                  設定
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  icon={<FaSignOutAlt />}
                  onClick={() => {
                    /* ログアウト処理 */
                  }}
                  _hover={{ bg: hoverBg }}
                  color="red.500"
                  py={3}
                >
                  ログアウト
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Container>

      {/* モバイルドロワー */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={bgColor}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <HStack>
              <Box bg="gray.900" p={2} borderRadius="lg">
                <Icon viewBox="0 0 24 24" boxSize={5} color="white">
                  <path
                    fill="currentColor"
                    d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
                  />
                </Icon>
              </Box>
              <Text fontSize="lg" fontWeight="bold">
                メニュー
              </Text>
            </HStack>
          </DrawerHeader>

          <DrawerBody pt={4}>
            <VStack spacing={2} align="stretch">
              {menuLists.map((menu, index) => {
                const isActive = location.pathname === menu.route;
                const hasNotification =
                  menu.route === route.saved && readSaveStatus;

                return (
                  <Box key={index} position="relative">
                    <Button
                      variant="ghost"
                      size="lg"
                      w="full"
                      justifyContent="start"
                      onClick={() => handleNavigation(menu.route)}
                      bg={isActive ? activeColor : "transparent"}
                      color={isActive ? "white" : textColor}
                      _hover={{
                        bg: isActive ? activeColor : hoverBg,
                      }}
                      fontWeight={isActive ? "bold" : "medium"}
                    >
                      {menu.text}
                      {hasNotification && (
                        <Badge
                          ml={2}
                          colorScheme="red"
                          borderRadius="full"
                          px={2}
                        >
                          新着
                        </Badge>
                      )}
                    </Button>
                  </Box>
                );
              })}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default RenderRouteLinks;
