import { Button } from "@chakra-ui/react";
import { FC, useCallback } from "react";
import { RiLogoutBoxRLine } from "react-icons/ri";
import useMyProfile from "../../hooks/useProfile";
import useAlert from "../../hooks/useAlert";
import useLog from "../../hooks/useLog";
import { useToast } from "@chakra-ui/react";

const Withdrawal: FC = () => {
  const toast = useToast();
  const { tradeAlert } = useAlert();
  const { logOutHandler } = useLog();
  const { cancellationProcess } = useMyProfile();

  // 退会処理
  const pushCancellationProcess = useCallback(async () => {
    const response = await cancellationProcess();
    console.log(response);
    if (response?.success === false) {
      toast({
        title: "退会処理エラー",
        description: response.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (response !== undefined && response.success) {
      tradeAlert(response.message).then((result) => {
        if (result.isConfirmed) {
          // OK 押下時の処理
          logOutHandler();
        }
      });
    }
  }, [cancellationProcess, logOutHandler, tradeAlert, toast]);

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
