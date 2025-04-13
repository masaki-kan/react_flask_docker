import { ChangeEvent, FC, useCallback, useState } from "react";
import {
  VStack,
  Heading,
  Box,
  FormControl,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react";
import { route } from "../../route/routeConst";
import { useNavigate } from "react-router-dom";
import RenderButton from "../common/render/renderButton";
import { singupApi } from "../../../api/loginApis";
import { sinupFormType } from "../../types/loginType";

interface ErrorState {
  emailError: string;
  passwordError: string;
}

const SingUpForm: FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<ErrorState>({
    emailError: "",
    passwordError: "",
  });
  const [form, setForm] = useState<sinupFormType>({
    username: "",
    email: "",
    password: "",
  });

  const singUpClick = () => {
    singupApi(form);
    navigate(route.login);
  };

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
        ...(type === "text" && { username: value }),
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
      >
        Create an account
      </Heading>
      <Box w={{ md: "480px", base: "90%" }} margin={"auto"}>
        <VStack py="3">
          <FormControl id="username">
            <FormLabel>Name</FormLabel>
            <Input
              placeholder="Enter your name"
              bg="#f4f2f0"
              borderColor="transparent"
              h="14"
              p="4"
              type="text"
              variant="filled"
              defaultValue={form.username}
              onChange={updateFormHandler}
            />
          </FormControl>
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
              isInvalid={error.passwordError ? true : false}
              placeholder="Enter your password"
              bg="#f4f2f0"
              borderColor="transparent"
              h="14"
              p="4"
              type="password"
              variant="filled"
              defaultValue={form.password}
              onChange={updateFormHandler}
            />
            {error.passwordError && (
              <Text fontSize="sm" style={{ color: "red" }}>
                {error.passwordError}
              </Text>
            )}
          </FormControl>
        </VStack>
        <RenderButton clickEvent={singUpClick} title="Sign up" />
      </Box>
    </>
  );
};

export default SingUpForm;
