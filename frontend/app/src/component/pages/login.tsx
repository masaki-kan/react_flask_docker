import { type FC, useCallback } from "react";
import Header from "../layout/header";
import Launch from "../../component/launch/home";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";

const Login: FC = () => {
  const navigate = useNavigate();

  const loginClick = useCallback(() => {
    navigate(route.login);
  }, [navigate]);

  return (
    <>
      <Header loginSwitch={loginClick} />
      <Launch />

      {/* <Modal
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
          <ModalBody px={0} pb={0}>
            <InputForm />
          </ModalBody>
        </ModalContent>
      </Modal>
      {!formSwitchStatus && <Launch />}
      {formSwitchStatus && <SingUpForm />} */}
    </>
  );
};

export default Login;
