import { FC, useMemo } from "react";
import { Avatar, HStack, Link } from "@chakra-ui/react";
import { route } from "../../../route/routeConst";
import { useNavigate } from "react-router-dom";
import { menuLists } from "../../../consts/menuList";
import useMyProfile from "../../../hooks/useProfile";

const RenderRouteLinks: FC = () => {
  const { memorizeProfile } = useMyProfile();

  const profile = useMemo(() => {
    return memorizeProfile;
  }, [memorizeProfile]);
  const navigate = useNavigate();

  const toProfile = () => {
    navigate(route.profile);
  };

  return (
    <>
      <HStack
        justifyContent={{ md: "space-between", base: "end" }}
        alignItems={"center"}
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
              mr={{ base: 4, md: 0 }}
            >
              {menu.text}
            </Link>
          );
        })}

        <Avatar
          size={"md"}
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
