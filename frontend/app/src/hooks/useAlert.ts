import { useToast } from "@chakra-ui/react";

type useAlertReturn = {
  defaultAlert: (status: boolean) => void;
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

  return {
    defaultAlert,
  };
};

export default useAlert;
