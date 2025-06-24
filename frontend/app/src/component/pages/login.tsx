import { type FC, useCallback, useState } from "react";
import Header from "../common/layout/header";
import InputForm from "../login/inputForm";
import SingUpForm from "../login/sinUp/singUpForm";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import Launch from "../../component/launch/home";

const Login: FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formSwitchStatus, setFormSwitchStatus] = useState<boolean>(false);

  const singUpClick = useCallback(() => {
    setFormSwitchStatus(true);
  }, []);

  const loginClick = useCallback(() => {
    if (formSwitchStatus) {
      setFormSwitchStatus(false);
      return;
    }
    onOpen();
  }, [formSwitchStatus, onOpen]);

  return (
    <>
      <Header singupClick={singUpClick} loginSwitch={loginClick} />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody px={0}>
            <InputForm />
          </ModalBody>
        </ModalContent>
      </Modal>
      {!formSwitchStatus && <Launch />}

      {formSwitchStatus && <SingUpForm loginClick={loginClick} />}
    </>
  );
};

export default Login;
