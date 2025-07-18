import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Text,
  InputGroup,
  InputRightElement,
  Box,
} from "@chakra-ui/react";
import { ChangeEvent, FC, memo, useState } from "react";
import {
  errorStateType,
  sinupFormType,
  stepsStatueType,
} from "../../../types/loginType";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";

type FormViewType = {
  error: errorStateType;
  form: sinupFormType;
  stepStatue: stepsStatueType;
  updateFormHandler: (e: ChangeEvent<HTMLInputElement>) => void;
};

const FormView: FC<FormViewType> = memo(
  ({ stepStatue, form, error, updateFormHandler }) => {
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);

    if (!stepStatue.form) return <></>;

    return (
      <VStack py="3">
        <FormControl id="username">
          <FormLabel>Name</FormLabel>
          <Input
            isInvalid={error.usernameError ? true : false}
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
          {error.usernameError && (
            <Text fontSize="sm" style={{ color: "red" }}>
              {error.usernameError}
            </Text>
          )}
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
          <FormLabel>
            Password
            <Text fontSize={"xs"}>半角英数字かつ8文字以上16文字以下</Text>
          </FormLabel>

          <InputGroup size="md">
            <Input
              isInvalid={error.passwordError ? true : false}
              placeholder="Enter your password"
              bg="#f4f2f0"
              borderColor="transparent"
              h="14"
              p="4"
              type={show ? "text" : "password"}
              variant="filled"
              defaultValue={form.password}
              onChange={updateFormHandler}
            />
            <InputRightElement width="4.5rem" top={2}>
              <Box onClick={handleClick}>
                {show ? <FaEye /> : <FaEyeSlash />}
              </Box>
            </InputRightElement>
          </InputGroup>
          {error.passwordError && (
            <Text fontSize="sm" style={{ color: "red" }}>
              {error.passwordError}
            </Text>
          )}
        </FormControl>
      </VStack>
    );
  }
);

export default FormView;
