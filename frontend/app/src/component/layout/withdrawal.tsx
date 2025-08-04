import { Button } from "@chakra-ui/react";
import { FC, useCallback } from "react";
import { RiLogoutBoxRLine } from "react-icons/ri";
import useMyProfile from "../../hooks/useProfile";
import useAlert from "../../hooks/useAlert";
import useLog from "../../hooks/useLog";
import { errorSweetalert2 } from "../../utils/alert/sweetalert2";

const Withdrawal: FC = () => {
  const { tradeAlert } = useAlert();
  const { logOutHandler } = useLog();
  const { cancellationProcess } = useMyProfile();

  // 退会処理
  const pushCancellationProcess = useCallback(async () => {
    const response = await cancellationProcess();
    console.log(response);
    if (response?.success === false) {
      errorSweetalert2(response.message);

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
  }, [cancellationProcess, logOutHandler, tradeAlert]);

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
