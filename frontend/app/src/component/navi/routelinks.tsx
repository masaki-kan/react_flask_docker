import { FC, useMemo, useCallback, useEffect, useState } from "react";
import {
  Box,
  Container,
  HStack,
  Avatar,
  Text,
  useColorModeValue,
  Icon,
  Link,
} from "@chakra-ui/react";
import { route } from "../../route/routeConst";
import { useNavigate } from "react-router-dom";
import { menuLists } from "../../consts/menuList";
import useMyProfile from "../../hooks/useProfile";
import useSaved from "../../hooks/useSaved";
import { FaUserCircle } from "react-icons/fa";
import { useEffectOnce } from "react-use";
import useAlert from "../../hooks/useAlert";

const RenderRouteLinks: FC = () => {
  const { warningToast } = useAlert();
  const { memorizeProfile, getMyProfile } = useMyProfile();
  const profile = useMemo(() => memorizeProfile, [memorizeProfile]);
  const navigate = useNavigate();

  const { savedList, getSavedListHandler } = useSaved();
  const [readSaveStatus, setReadSaveStatus] = useState<boolean>(false);

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
    getMyProfile();
  }, [getMyProfile, readSaveTimestamps, savedList, unCompletedList]);

  useEffectOnce(() => {
    getSavedListHandler();
  });

  const naviFilter = useCallback(
    (path: string) => {
      if (path !== route.thread) {
        if (profile.items.length === 0) {
          warningToast("アイテムを最低1点登録してください。");

          navigate(route.myItem);
          return;
        }
      }

      navigate(path);
    },
    [navigate, profile, warningToast]
  );

  return (
    <>
      <Container maxW="container.xl">
        <HStack justify="end" align="end">
          {/* デスクトップナビゲーション */}
          {menuLists.map((menu, index) => {
            return (
              <Link
                key={index}
                fontSize={"sm"}
                color="#181411"
                fontWeight="medium"
                onClick={() => {
                  naviFilter(menu.route);
                }}
                position={"relative"}
                mr={2}
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
              <>
                <Icon as={FaUserCircle} boxSize={8} />
              </>
            )}
          </HStack>
        </HStack>
      </Container>
    </>
  );
};

export default RenderRouteLinks;
