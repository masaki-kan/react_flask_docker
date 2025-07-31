import { Button } from "@chakra-ui/react";
import { FC } from "react";
import { RiLogoutBoxRLine } from "react-icons/ri";
import useLog from "../../hooks/useLog";

const LogOut: FC = () => {
  const { logOutHandler } = useLog();

  return (
    <Button
      leftIcon={<RiLogoutBoxRLine />}
      variant="solid"
      onClick={logOutHandler}
    >
      Log out
    </Button>
  );
};

export default LogOut;
