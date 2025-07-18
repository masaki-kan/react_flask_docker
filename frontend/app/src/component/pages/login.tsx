import { type FC, useCallback, useState } from "react";
import Header from "../common/layout/header";
import InputForm from "../login/inputForm";
import SingUpForm from "../login/sinUp/singUpForm";
import {
  Modal,
  ModalBody,
  // ModalCloseButton,
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
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="md"
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
        <ModalContent
          borderRadius="2xl"
          boxShadow="2xl"
          bg="white"
          overflow="hidden"
          mx={4}
        >
          {/* <ModalCloseButton
            size="lg"
            top={4}
            right={4}
            color="gray.500"
            _hover={{
              color: "gray.700",
              bg: "gray.100",
              transform: "rotate(90deg)",
            }}
            transition="all 0.3s"
            borderRadius="full"
          /> */}
          <ModalBody px={0} pb={0}>
            <InputForm />
          </ModalBody>
        </ModalContent>
      </Modal>
      {!formSwitchStatus && <Launch />}
      {formSwitchStatus && <SingUpForm />}
    </>
  );
};

export default Login;
