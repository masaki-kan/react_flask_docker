import { ChangeEvent, FC, useCallback, useEffect, useState } from "react";
import {
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Text,
  Box,
  HStack,
} from "@chakra-ui/react";
import { route } from "../../route/routeConst";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../../api/loginApis";
import { useAuth } from "../../provider/authContext";
import useAlert from "../../hooks/useAlert";
import RenderButton from "../common/render/renderButton";

interface ErrorState {
  emailError: string;
  passwordError: string;
}

interface loginFormType {
  email: string;
  password: string;
}

const InputForm: FC = () => {
  const { errorAlert } = useAlert();
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<ErrorState>({
    emailError: "",
    passwordError: "",
  });
  const [form, setForm] = useState<loginFormType>({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isLoggedIn) {
      navigate(route.home);
    }
  }, [isLoggedIn, navigate]);

  const loginClick = useCallback(async () => {
    const { email, password } = form;

    // バリデーションチェック
    const emailValid = validateEmail(email);
    const passwordValid = validatePassword(password);

    // エラーがあれば表示して終了
    setError({
      emailError: emailValid ? "" : "Please enter a valid email address.",
      passwordError: passwordValid
        ? ""
        : "Password must contain only lowercase and digits.",
    });

    if (!emailValid || !passwordValid) {
      return; // エラーがあるため処理中断
    }

    // ログインAPI実行
    const response = await loginApi(form);
    if (response && response.token) {
      login(response.username, response.token, response.userId);
      navigate(route.home);

      return;
    }
    errorAlert("ログインに失敗しました。");
  }, [errorAlert, form, login, navigate]);

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
        ...(type === "email" && { email: value }),
        ...(type === "password" && { password: value }),
      }));
    },
    [formErrorCheckHanler]
  );

  return (
    <>
      <Heading
        color="#181411"
        fontSize="22px"
        fontWeight="bold"
        textAlign="center"
        px="4"
        pb="3"
        pt="5"
        mt={4}
      >
        Welcome back to Retro Threads
      </Heading>
      <Box w={{ md: "100%", base: "90%" }} py={2} px={3} margin={"auto"}>
        <VStack py="3">
          <FormControl id="email">
            <FormLabel>Email</FormLabel>
            <Input
              isInvalid={!!error.emailError}
              placeholder="example@gmail.com"
              bg="#f4f2f0"
              borderColor="transparent"
              h="14"
              p="4"
              w={"full"}
              type="email"
              variant="filled"
              value={form.email}
              onChange={updateFormHandler}
            />
            {error.emailError && (
              <Text fontSize="sm" style={{ color: "red" }}>
                {error.emailError}
              </Text>
            )}
          </FormControl>
          <FormControl id="password">
            <HStack alignItems={"center"} mb={3}>
              <FormLabel mb={0}>Password</FormLabel>
              <Text fontSize={"xs"} color={"gray.500"}>
                半角英数字16文字以下
              </Text>
            </HStack>

            <Input
              isInvalid={!!error.passwordError}
              placeholder="Enter your password"
              bg="#f4f2f0"
              borderColor="transparent"
              h="14"
              p="4"
              type="password"
              variant="filled"
              value={form.password}
              onChange={updateFormHandler}
            />
            {error.passwordError && (
              <Text fontSize="sm" style={{ color: "red" }}>
                {error.passwordError}
              </Text>
            )}
          </FormControl>
        </VStack>
        <Box mx={"auto"} width={"80%"} mt={4}>
          <RenderButton clickEvent={loginClick} title={"Log in"} />
        </Box>

        {/* <VStack marginTop={4}>
          <Link color="#887563">Forgot your password?</Link>
          <Link color="#887563">Don't have an account? Sign up</Link>
        </VStack> */}
      </Box>
    </>
  );
};

export default InputForm;
