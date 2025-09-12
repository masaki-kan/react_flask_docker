import { Button } from "@chakra-ui/react";
import { FC, useCallback } from "react";
import { RiLogoutBoxRLine } from "react-icons/ri";
import useMyProfile from "../../hooks/useProfile";

const Withdrawal: FC = () => {
  const { cancellationProcess } = useMyProfile();

  // 退会処理
  const pushCancellationProcess = useCallback(async () => {
    await cancellationProcess();
  }, [cancellationProcess]);

  return (
    <Button
      leftIcon={<RiLogoutBoxRLine />}
      variant="solid"
      colorScheme="red"
      onClick={pushCancellationProcess}
    >
      退会
    </Button>
  );
};

export default Withdrawal;
