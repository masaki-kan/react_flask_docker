import { FC, useMemo, useCallback, useEffect, useState } from "react";
import { Avatar, Box, HStack, Link, Text } from "@chakra-ui/react";
import { route } from "../../../route/routeConst";
import { useNavigate } from "react-router-dom";
import { menuLists } from "../../../consts/menuList";
import useMyProfile from "../../../hooks/useProfile";
import useSaved from "../../../hooks/useSaved";
import { FaExclamation } from "react-icons/fa";
import { useEffectOnce } from "react-use";
import { FaUserCircle } from "react-icons/fa";

const RenderRouteLinks: FC = () => {
  const { memorizeProfile } = useMyProfile();
  const profile = useMemo(() => {
    return memorizeProfile;
  }, [memorizeProfile]);
  const navigate = useNavigate();

  const { savedList, getSavedListHandler } = useSaved();
  const [readSaveStatus, setReadSaveStatus] = useState<boolean>(false);
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
      .map((list) => {
        return list;
      });
  }, [savedList]);

  const toProfile = () => {
    navigate(route.profile);
  };

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
      <HStack
        justifyContent={{ md: "space-between", base: "end" }}
        alignItems={"end"}
        gap={{ base: 3, md: 9 }}
        mr={0}
      >
        {menuLists.map((menu, index) => {
          return (
            <Link
              key={index}
              color="#181411"
              fontSize="sm"
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
                    top={-2}
                    right={-2}
                    borderRadius={"50%"}
                    bgColor={"#b03a3a"}
                    p={1}
                  >
                    <FaExclamation size={7} color="white" />
                  </Box>
                </>
              )}
            </Link>
          );
        })}

        {profile.profile.image.length > 0 ? (
          <Avatar
            size={"md"}
            ml={4}
            name={"my name"}
            onClick={toProfile}
            src={profile.profile.image}
          />
        ) : (
          <>
            <Box ml={4}>
              <FaUserCircle
                size={"45px"}
                color="gray.500"
                onClick={toProfile}
              />
            </Box>
          </>
        )}
      </HStack>
    </>
  );
};

export default RenderRouteLinks;
