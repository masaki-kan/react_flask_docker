import { type FC, useCallback, useState } from "react";
import Header from "../common/header";
import InputForm from "../login/inputForm";
import SingUpForm from "../login/singUpForm";

const Login: FC = () => {
  const [formSwitchStatus, setFormSwitchStatus] = useState<boolean>(false);

  const singUpClick = useCallback(() => {
    setFormSwitchStatus(true);
  }, []);

  const loginClick = useCallback(() => {
    setFormSwitchStatus(false);
  }, []);

  return (
    <>
      <Header
        singupClick={singUpClick}
        loginSwitch={loginClick}
        formSwitchStatus={formSwitchStatus}
      />
      {!formSwitchStatus ? <InputForm /> : <SingUpForm />}
    </>
  );
};

export default Login;
