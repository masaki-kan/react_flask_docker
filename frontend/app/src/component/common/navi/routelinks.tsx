import { FC } from "react";
import { Avatar, HStack, Link } from "@chakra-ui/react";
import { route } from "../../../route/routeConst";
import { useNavigate } from "react-router-dom";
import { menuLists } from "../../../consts/menuList";

const RenderRouteLinks: FC = () => {
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
          src="https://cdn.usegalileo.ai/sdxl10/014920d7-e0b4-4ffa-823a-811dd0d3cdbc.png"
          name="my user"
          size={"md"}
          onClick={toProfile}
        />
      </HStack>
    </>
  );
};

export default RenderRouteLinks;
