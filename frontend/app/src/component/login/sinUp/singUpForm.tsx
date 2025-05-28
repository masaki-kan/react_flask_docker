import { ChangeEvent, FC, useCallback, useState } from "react";
import { Heading, Card, Box, Button, Text } from "@chakra-ui/react";
import RenderButton from "../../common/render/renderButton";
import {
  sinupFormType,
  errorStateType,
  stepsStatueType,
} from "../../../types/loginType";
import SelectedPlanView from "./selectedPlanView";
import FormView from "./formView";
import CreditForm from "./creditForm";

type SingUpFormType = {
  loginClick: () => void;
};

const SingUpForm: FC<SingUpFormType> = ({ loginClick }) => {
  const [error, setError] = useState<errorStateType>({
    usernameError: "",
    emailError: "",
    passwordError: "",
  });
  const [form, setForm] = useState<sinupFormType>({
    username: "",
    email: "",
    password: "",
    plan: "1",
  });

  const [stepsStatue, setStepsStatue] = useState<stepsStatueType>({
    form: true,
    select: false,
    credit: false,
  });
  const [errorState, setErrorState] = useState<boolean>(false);

  const singUp = useCallback(async () => {
    const { email, password, username } = form;

    // バリデーションチェック
    const usernameValid = username.length > 0 ? true : false;
    const emailValid = validateEmail(email);
    const passwordValid = validatePassword(password);

    // エラーがあれば表示して終了
    setError({
      usernameError: usernameValid ? "" : "Please enter a valid user name.",
      emailError: emailValid ? "" : "Please enter a valid email address.",
      passwordError: passwordValid
        ? ""
        : "Password must contain only lowercase and digits.",
    });
    if (!usernameValid || !emailValid || !passwordValid) {
      setErrorState(true);
      return; // エラーがあるため処理中断
    }
  }, [form]);

  const validatePassword = (password: string): boolean => {
    // 半角英数字かつ16文字以下
    return /^[a-zA-Z0-9]+$/.test(password) && password.length <= 16;
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const formErrorCheckHanler = useCallback((value: string, type: string) => {
    if (type === "password") {
      if (!value) {
        setError((prev) => ({
          ...prev,
          passwordError: "Password is required.",
        }));
      } else if (!validatePassword(value)) {
        setError((prev) => ({
          ...prev,
          passwordError:
            "Password must be alphanumeric and 10 characters or fewer.",
        }));
      } else {
        setError((prev) => ({ ...prev, passwordError: "" }));
      }
    } else if (type === "email") {
      if (!value) {
        setError((prev) => ({
          ...prev,
          emailError: "Email is required.",
        }));
      } else if (!validateEmail(value)) {
        setError((prev) => ({
          ...prev,
          emailError: "Please enter a valid email address.",
        }));
      } else {
        setError((prev) => ({ ...prev, emailError: "" }));
      }
    }
  }, []);

  const updateFormHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value, type } = e.target;

      formErrorCheckHanler(value, type);

      setForm((prev) => ({
        ...prev,
        ...(type === "text" && { username: value }),
        ...(type === "email" && { email: value }),
        ...(type === "password" && { password: value }),
      }));
    },
    [formErrorCheckHanler]
  );

  const changePlanHandler = useCallback((nextValue: string) => {
    setForm((prev) => ({
      ...prev,
      plan: nextValue,
    }));
  }, []);

  return (
    <>
      <Heading
        color="#181411"
        fontSize="22px"
        fontWeight="bold"
        textAlign="center"
        px="4"
        py="5"
      >
        Create an account
      </Heading>
      <Card w={{ md: "550px", base: "90%" }} py={4} px={3} margin={"auto"}>
        <Text
          hidden={!errorState}
          fontSize={"sm"}
          textAlign={"center"}
          color={"red"}
        >
          未入力項目もしくは、正しく入力されていない項目があります。
        </Text>
        <FormView
          error={error}
          form={form}
          updateFormHandler={updateFormHandler}
          stepStatue={stepsStatue}
        />
        <SelectedPlanView
          stepStatue={stepsStatue}
          form={form}
          changePlanHandler={changePlanHandler}
        />
        {stepsStatue.credit && (
          <CreditForm
            form={form}
            singUpEvent={singUp}
            stepStatue={stepsStatue}
            changePlanHandler={changePlanHandler}
            loginClick={loginClick}
          />
        )}

        <Box mx={"auto"} width={"80%"}>
          {stepsStatue.form && (
            <>
              <RenderButton
                clickEvent={() => {
                  setStepsStatue((prev) => ({
                    ...prev,
                    form: false,
                    select: true,
                  }));
                }}
                title="次へ"
              />
            </>
          )}
          {stepsStatue.select && (
            <>
              <Button
                minW="84px"
                maxW={{ base: "100%", md: "480px" }}
                bg="#e68019"
                color="#181411"
                fontSize="sm"
                fontWeight="bold"
                mt="3"
                w="full"
                onClick={() => {
                  setStepsStatue((prev) => ({
                    ...prev,
                    form: true,
                    select: false,
                    credit: false,
                  }));
                }}
              >
                戻る
              </Button>

              <RenderButton
                clickEvent={() => {
                  setStepsStatue((prev) => ({
                    ...prev,
                    form: false,
                    select: false,
                    credit: true,
                  }));
                }}
                title="次へ"
              />
            </>
          )}

          {stepsStatue.credit && (
            <>
              <Button
                minW="84px"
                maxW={{ base: "100%", md: "480px" }}
                bg="#e68019"
                color="#181411"
                fontSize="sm"
                fontWeight="bold"
                mt="3"
                w="full"
                onClick={() => {
                  setStepsStatue((prev) => ({
                    ...prev,
                    form: false,
                    select: true,
                    credit: false,
                  }));
                }}
              >
                戻る
              </Button>
            </>
          )}
        </Box>
      </Card>
    </>
  );
};

export default SingUpForm;
