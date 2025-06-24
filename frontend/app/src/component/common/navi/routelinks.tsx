import { FC, useMemo, useCallback, useEffect, useState } from "react";
import { Avatar, Box, HStack, Link } from "@chakra-ui/react";
import { route } from "../../../route/routeConst";
import { useNavigate } from "react-router-dom";
import { menuLists } from "../../../consts/menuList";
import useMyProfile from "../../../hooks/useProfile";
import useSaved from "../../../hooks/useSaved";
import { FaExclamation } from "react-icons/fa";

const RenderRouteLinks: FC = () => {
  const { memorizeProfile } = useMyProfile();
  const profile = useMemo(() => {
    return memorizeProfile;
  }, [memorizeProfile]);
  const navigate = useNavigate();
  const { savedList } = useSaved();
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

    console.log("newArray", newArray);
    const isNew = newArray.find((item) => item.isNew === true)?.isNew ?? false;
    setReadSaveStatus(isNew);
  }, [readSaveTimestamps, savedList, unCompletedList]);

  return (
    <>
      <HStack
        justifyContent={{ md: "space-between", base: "end" }}
        alignItems={"end"}
        align="center"
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
              mr={{ base: 4, md: 0 }}
              position={"relative"}
            >
              {menu.text}
              {menu.route === route.saved && (
                <>
                  <Box
                    hidden={!readSaveStatus}
                    position={"absolute"}
                    top={0}
                    right={-5}
                    borderRadius={"50%"}
                    bgColor={"#b03a3a"}
                    p={1}
                  >
                    <FaExclamation size={10} color="white" />
                  </Box>
                </>
              )}
            </Link>
          );
        })}

        <Avatar
          size={"sm"}
          mr={4}
          name={"my name"}
          onClick={toProfile}
          src={
            profile.profile.image.length > 0
              ? profile.profile.image
              : "https://bit.ly/broken-link"
          }
        />
      </HStack>
    </>
  );
};

export default RenderRouteLinks;
