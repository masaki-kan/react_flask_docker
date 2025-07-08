import { useToast } from "@chakra-ui/react";
import Swal, { SweetAlertResult } from "sweetalert2";

type useAlertReturn = {
  errorAlert: (text: string) => void;
  defaultAlert: (status: boolean) => void;
  successAlert: (text: string) => void;
  defaultToast: (text: string) => void;
  tradeAlert: (text: string) => Promise<SweetAlertResult<unknown>>;
  sweetSuccessOverAlert: (title: string) => Promise<SweetAlertResult<unknown>>;
  sweetSuccessTextOverAlert: (
    text: string
  ) => Promise<SweetAlertResult<unknown>>;
  sweetErrorOverAlert: () => Promise<SweetAlertResult<unknown>>;
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

  const successAlert = (text: string) => {
    toast({
      title: text,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const sweetSuccessTextOverAlert = (text: string) => {
    return Swal.fire({
      title: text,
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

  const sweetSuccessOverAlert = (title: string) => {
    return Swal.fire({
      title,
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
    successAlert,
    errorAlert,
    defaultAlert,
    defaultToast,
    tradeAlert,
    sweetSuccessOverAlert,
    sweetSuccessTextOverAlert,
    sweetErrorOverAlert,
    favoriteAlert,
  };
};

export default useAlert;
