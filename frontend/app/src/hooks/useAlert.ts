import { useToast } from "@chakra-ui/react";
import Swal, { SweetAlertResult } from "sweetalert2";

type useAlertReturn = {
  errorAlert: (text: string) => void;
  defaultAlert: (status: boolean) => void;
  defaultToast: (text: string) => void;
  warningToast: (text: string) => void;
  tradeAlert: (text: string) => Promise<SweetAlertResult<unknown>>;
  sweetSuccessTextOverAlert: (
    text: string
  ) => Promise<SweetAlertResult<unknown>>;
  sweetErrorOverAlert: () => Promise<SweetAlertResult<unknown>>;
  sweetStripeErrorOverAlert: () => Promise<SweetAlertResult<unknown>>;
  favoriteAlert: (text: string) => void;
};

const useAlert = (): useAlertReturn => {
  const toast = useToast();

  const errorAlert = (text: string) => {
    return Swal.fire({
      title: text,
      icon: "error",
      draggable: true,
    });
  };

  const defaultAlert = (status: boolean) => {
    toast({
      title: "no item",
      status: status ? "info" : "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const defaultToast = (text: string) => {
    toast({
      title: text,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const warningToast = (text: string) => {
    toast({
      title: text,
      status: "warning",
      duration: 2000,
      isClosable: true,
    });
  };

  const sweetSuccessTextOverAlert = (text: string) => {
    return Swal.fire({
      title: `<p style="font-size: 1rem; margin: 0;">${text}</p>`,
      icon: "success",
      draggable: true,
    });
  };

  const favoriteAlert = (text: string) => {
    toast({
      title: text,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const tradeAlert = (text: string) => {
    return Swal.fire({
      title: text,
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

  const sweetStripeErrorOverAlert = () => {
    return Swal.fire({
      title: "クレジット登録にエラーが発生しました。",
      text: "入力内容が間違っていないか確認ください。",
      icon: "error",
      draggable: true,
    });
  };

  return {
    errorAlert,
    defaultAlert,
    warningToast,
    defaultToast,
    tradeAlert,
    sweetSuccessTextOverAlert,
    sweetErrorOverAlert,
    sweetStripeErrorOverAlert,
    favoriteAlert,
  };
};

export default useAlert;
