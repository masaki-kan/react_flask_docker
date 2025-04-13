import { ChangeEvent, FC, useCallback, useEffect, useState } from "react";
import {
  VStack,
  Heading,
  Box,
  FormControl,
  FormLabel,
  Input,
  Link,
  Text,
} from "@chakra-ui/react";
import { route } from "../../route/routeConst";
import { useNavigate } from "react-router-dom";
import RenderButton from "../common/render/renderButton";
import { loginApi } from "../../../api/loginApis";
import { useAuth } from "../../provider/authContext";

interface ErrorState {
  emailError: string;
  passwordError: string;
}

interface loginFormType {
  email: string;
  password: string;
}

const InputForm: FC = () => {
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
    const response = await loginApi(form);

    if (response && response.token) {
      login(response.username, response.token, response.userId);
    }
  }, [form, login]);

  const validatePassword = (password: string): boolean => {
    // 小文字英数字のみの正規表現
    return /^[a-z0-9]+$/i.test(password);
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const formErrorCheckHanler = useCallback((value: string, type: string) => {
    if (type === "password") {
      if (validatePassword(value)) {
        setError((prev) => ({ ...prev, passwordError: "" }));
      } else {
        setError((prev) => ({
          ...prev,
          passwordError: "Password must contain only lowercase and digits.",
        }));
      }
    } else if (type === "email") {
      if (validateEmail(value)) {
        setError((prev) => ({ ...prev, emailError: "" }));
      } else {
        setError((prev) => ({
          ...prev,
          emailError: "Please enter a valid email address.",
        }));
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
      <Box w={{ md: "480px", base: "90%" }} margin={"auto"}>
        <VStack py="3">
          <FormControl id="email">
            <FormLabel>Email</FormLabel>
            <Input
              isInvalid={error.emailError ? true : false}
              placeholder="example@gmail.com"
              bg="#f4f2f0"
              borderColor="transparent"
              h="14"
              p="4"
              type="email"
              variant="filled"
              defaultValue={form.email}
              onChange={updateFormHandler}
            />
            {error.emailError && (
              <Text fontSize="sm" style={{ color: "red" }}>
                {error.emailError}
              </Text>
            )}
          </FormControl>
          <FormControl id="password">
            <FormLabel>Password</FormLabel>
            <Input
              isInvalid={error.emailError ? true : false}
              placeholder="Enter your password"
              bg="#f4f2f0"
              borderColor="transparent"
              h="14"
              p="4"
              type="password"
              variant="filled"
              defaultValue={form.email}
              onChange={updateFormHandler}
            />
          </FormControl>
        </VStack>
        <RenderButton clickEvent={loginClick} title="Log in" />
        <VStack marginTop={4}>
          <Link color="#887563">Forgot your password?</Link>
          <Link color="#887563">Don't have an account? Sign up</Link>
        </VStack>
      </Box>
    </>
  );
};

export default InputForm;
