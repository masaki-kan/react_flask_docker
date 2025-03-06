import {
  VStack,
  Heading,
  Box,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { FC } from "react";
import { route } from "../../route/routeConst";
import { useNavigate } from "react-router-dom";
import RenderButton from "../common/renderButton";

const SingUpForm: FC = () => {
  const navigate = useNavigate();

  const singUpClick = () => {
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
              type="name"
            />
          </FormControl>
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
        <RenderButton clickEvent={singUpClick} title="Sign up" />
      </Box>
    </>
  );
};

export default SingUpForm;
