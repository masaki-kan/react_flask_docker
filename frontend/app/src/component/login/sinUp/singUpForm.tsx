import { ChangeEvent, FC, memo, useCallback, useMemo, useState } from "react";
import { Heading, Card, Box, Button } from "@chakra-ui/react";
import RenderButton from "../../common/render/renderButton";
import {
  sinupFormType,
  errorStateType,
  stepsStatueType,
} from "../../../types/loginType";
import SelectedPlanView from "./selectedPlanView";
import FormView from "./formView";
import { loginCheckApi } from "../../../api/loginApis";
import CreditForm from "./creditForm";
import useAlert from "../../../hooks/useAlert";
import useLoading from "../../../hooks/useLaoding";

type SingUpFormType = {
  loginClick: () => void;
};

const SingUpForm: FC<SingUpFormType> = memo(({ loginClick }) => {
  const { memorizeLoading, changeLoading } = useLoading();
  const { errorAlert } = useAlert();
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
    stripeCustomerId: "",
    intentId: "",
    clientSecret: "",
  });

  const [stepsStatue, setStepsStatue] = useState<stepsStatueType>({
    form: true,
    select: false,
    credit: false,
  });

  const errorCheck = useCallback(async (): Promise<boolean> => {
    changeLoading(true);
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
      return false; // エラーがあるため処理中断
    }

    const formdata = { email: email };
    const response = await loginCheckApi(formdata);

    if (!response?.result) {
      changeLoading(false);
      return true;
    } else {
      errorAlert(
        "このメールアドレスはすでに登録されております。別のアドレスで登録してください。"
      );
      changeLoading(false);
      return false; // エラーがあるため処理中断
    }
  }, [changeLoading, errorAlert, form]);

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
      return; // エラーがあるため処理中断
    }
  }, [form]);

  const validatePassword = (password: string): boolean => {
    return /^[a-zA-Z0-9]{8,16}$/.test(password);
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

  const changeStripeCustomerIdHandler = useCallback(
    (stripeCustomerId: string) => {
      setForm((prev) => ({
        ...prev,
        stripeCustomerId,
      }));
    },
    []
  );

  const changeClientSecretIdHandler = useCallback((clientSecret: string) => {
    setForm((prev) => ({
      ...prev,
      clientSecret,
    }));
  }, []);

  const changeIntentIdIdHandler = useCallback((intentId: string) => {
    setForm((prev) => ({
      ...prev,
      intentId,
    }));
  }, []);

  const formViewComponent = useMemo(() => {
    return (
      <FormView
        error={error}
        form={form}
        updateFormHandler={updateFormHandler}
        stepStatue={stepsStatue}
      />
    );
  }, [error, form, stepsStatue, updateFormHandler]);

  const selectedPlanView = useMemo(() => {
    return (
      <SelectedPlanView
        stepStatue={stepsStatue}
        form={form}
        changePlanHandler={changePlanHandler}
      />
    );
  }, [changePlanHandler, form, stepsStatue]);

  const creditFormComponent = useMemo(() => {
    return (
      <CreditForm
        form={form}
        singUpEvent={singUp}
        stepStatue={stepsStatue}
        changeStripeCustomerIdHandler={changeStripeCustomerIdHandler}
        changeClientSecretIdHandler={changeClientSecretIdHandler}
        changeIntentIdIdHandler={changeIntentIdIdHandler}
        changePlanHandler={changePlanHandler}
        loginClick={loginClick}
      />
    );
  }, [
    form,
    singUp,
    stepsStatue,
    changeStripeCustomerIdHandler,
    changeClientSecretIdHandler,
    changeIntentIdIdHandler,
    changePlanHandler,
    loginClick,
  ]);

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
        {formViewComponent}
        {selectedPlanView}
        {stepsStatue.credit && <>{creditFormComponent}</>}

        <Box mx={"auto"} width={"80%"}>
          {stepsStatue.form && (
            <>
              <RenderButton
                clickEvent={async () => {
                  if (await errorCheck())
                    setStepsStatue((prev) => ({
                      ...prev,
                      form: false,
                      select: true,
                    }));
                }}
                disable={memorizeLoading}
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
                  errorCheck();
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
});

export default SingUpForm;
