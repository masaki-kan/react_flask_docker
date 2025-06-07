import { Button } from "@chakra-ui/react";
import { FC, useCallback } from "react";
import { RiLogoutBoxRLine } from "react-icons/ri";
import useMyProfile from "../../../hooks/useProfile";
import useAlert from "../../../hooks/useAlert";
import { useNavigate } from "react-router-dom";
import { route } from "../../../route/routeConst";

const Withdrawal: FC = () => {
  const { tradeAlert } = useAlert();
  const navigate = useNavigate();
  const { cancellationProcess } = useMyProfile();

  const pushCancellationProcess = useCallback(async () => {
    const response = await cancellationProcess();
    console.log("response", response);
    // tradeAlert(response).then((result) => {
    //   if (result.isConfirmed) {
    //     // OK 押下時の処理
    //     // navigate(route.login);
    //   }
    // });
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
