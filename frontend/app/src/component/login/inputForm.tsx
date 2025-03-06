import {
  VStack,
  Heading,
  Box,
  FormControl,
  FormLabel,
  Input,
  Link,
} from "@chakra-ui/react";
import { FC } from "react";
import { route } from "../../route/routeConst";
import { useNavigate } from "react-router-dom";
import RenderButton from "../common/renderButton";

const InputForm: FC = () => {
  const navigate = useNavigate();

  const loginClick = () => {
    navigate(route.home);
  };

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
              placeholder="example@gmail.com"
              bg="#f4f2f0"
              borderColor="transparent"
              h="14"
              p="4"
              type="email"
            />
          </FormControl>
          <FormControl id="password">
            <FormLabel>Password</FormLabel>
            <Input
              placeholder="Enter your password"
              bg="#f4f2f0"
              borderColor="transparent"
              h="14"
              p="4"
              type="password"
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
