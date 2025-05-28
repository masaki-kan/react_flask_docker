import { VStack, FormControl, FormLabel, Input, Text } from "@chakra-ui/react";
import { ChangeEvent, FC } from "react";
import {
  errorStateType,
  sinupFormType,
  stepsStatueType,
} from "../../../types/loginType";

type FormViewType = {
  error: errorStateType;
  form: sinupFormType;
  stepStatue: stepsStatueType;
  updateFormHandler: (e: ChangeEvent<HTMLInputElement>) => void;
};

const FormView: FC<FormViewType> = ({
  stepStatue,
  form,
  error,
  updateFormHandler,
}) => {
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
  );
};

export default FormView;
