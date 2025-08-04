import { FC, useMemo, useCallback, useEffect, useState } from "react";
import {
  Box,
  Container,
  HStack,
  Avatar,
  Text,
  useColorModeValue,
  Icon,
  // Menu,
  // MenuButton,
  // MenuList,
  // MenuItem,
  // MenuDivider,
  Link,
} from "@chakra-ui/react";
import { route } from "../../route/routeConst";
import { useNavigate } from "react-router-dom";
import { menuLists } from "../../consts/menuList";
import useMyProfile from "../../hooks/useProfile";
import useSaved from "../../hooks/useSaved";
import { FaUserCircle } from "react-icons/fa";
import { useEffectOnce } from "react-use";

const RenderRouteLinks: FC = () => {
  const { memorizeProfile } = useMyProfile();
  const profile = useMemo(() => memorizeProfile, [memorizeProfile]);
  const navigate = useNavigate();

  const { savedList, getSavedListHandler } = useSaved();
  const [readSaveStatus, setReadSaveStatus] = useState<boolean>(false);

  // カラーモード対応
  // const bgColor = useColorModeValue("white", "gray.800");
  // const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const activeColor = useColorModeValue("blue.500", "blue.400");

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

  return (
    <>
      <Container maxW="container.xl">
        <HStack justify="space-between" align="end">
          {/* デスクトップナビゲーション */}
          {menuLists.map((menu, index) => {
            return (
              <Link
                key={index}
                fontSize={"sm"}
                color="#181411"
                fontWeight="medium"
                href={menu.route}
                onClick={() => {}}
                position={"relative"}
              >
                <Text fontSize={"sm"}>{menu.text}</Text>
                {menu.route === route.saved && (
                  <>
                    <Box
                      hidden={!readSaveStatus}
                      position={"absolute"}
                      top={-2.5}
                      right={-2.5}
                      borderRadius={"50%"}
                      bgColor={"#b03a3a"}
                      p={2}
                    ></Box>
                  </>
                )}
              </Link>
            );
          })}

          {/* プロフィールメニュー */}
          <HStack spacing={4} onClick={() => navigate(route.profile)}>
            {/* アバターメニュー */}
            {profile.profile.image?.length > 0 ? (
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
            {/* <Menu>
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
              </MenuList>
            </Menu> */}
          </HStack>
        </HStack>
      </Container>
    </>
  );
};

export default RenderRouteLinks;
