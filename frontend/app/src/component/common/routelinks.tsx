import { FC } from "react";
import { Avatar, HStack, Link } from "@chakra-ui/react";
import { route } from "../../route/routeConst";

const RenderRouteLinks: FC = () => {
  return (
    <>
      <HStack
        justifyContent={"space-between"}
        alignItems={"center"}
        align="center"
        gap={{ base: 4, md: 9 }}
        mr={0}
      >
        <Link
          color="#181411"
          fontSize="sm"
          fontWeight="medium"
          href={route.listings}
        >
          Listings
        </Link>
        <Link color="#181411" fontSize="sm" fontWeight="medium">
          Saved
        </Link>
        <Link color="#181411" fontSize="sm" fontWeight="medium">
          Messages
        </Link>
        <Link color="#181411" fontSize="sm" fontWeight="medium">
          Purchases
        </Link>
        <Link
          color="#181411"
          fontSize="sm"
          fontWeight="medium"
          href={route.profile}
        >
          Profile
        </Link>
        <Avatar
          src="https://cdn.usegalileo.ai/sdxl10/014920d7-e0b4-4ffa-823a-811dd0d3cdbc.png"
          name="my user"
          size={"md"}
        />
      </HStack>
    </>
  );
};

export default RenderRouteLinks;
