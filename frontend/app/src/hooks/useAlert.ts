import { useToast } from "@chakra-ui/react";
import Swal, { SweetAlertResult } from "sweetalert2";

type useAlertReturn = {
  defaultAlert: (status: boolean) => void;
  followAlert: (text: string) => void;
  sweetSuccessOverAlert: () => Promise<SweetAlertResult<unknown>>;
  sweetErrorOverAlert: () => Promise<SweetAlertResult<unknown>>;
};

const useAlert = (): useAlertReturn => {
  const toast = useToast();

  const defaultAlert = (status: boolean) => {
    toast({
      title: "no item",
      status: status ? "info" : "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const followAlert = (text: string) => {
    toast({
      title: text,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const sweetSuccessOverAlert = () => {
    return Swal.fire({
      title: "更新完了",
      icon: "success",
      draggable: true,
    });
  };

  const sweetErrorOverAlert = () => {
    return Swal.fire({
      title: "システムエラーが発生しました。",
      text: "管理者へお問い合わせください。",
      icon: "error",
      draggable: true,
    });
  };

  return {
    defaultAlert,
    followAlert,
    sweetSuccessOverAlert,
    sweetErrorOverAlert,
  };
};

export default useAlert;
