import { FC, useState, useCallback } from "react";
import {
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Text,
  Box,
  Button,
  Link,
  Alert,
  AlertIcon,
  AlertDescription,
  Container,
} from "@chakra-ui/react";
import { route } from "../../route/routeConst";
import { useNavigate } from "react-router-dom";
import { forgotPasswordApi } from "../../api/loginApis";

const ForgotPassword: FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = useCallback(async () => {
    if (!email) {
      setEmailError("メールアドレスを入力してください");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("有効なメールアドレスを入力してください");
      return;
    }

    setIsLoading(true);
    setEmailError("");

    const response = await forgotPasswordApi(email);
    setIsLoading(false);

    if (response.success) {
      setIsSent(true);
    } else {
      setEmailError(response.error || "送信に失敗しました");
    }
  }, [email]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && email) {
        handleSubmit();
      }
    },
    [email, handleSubmit],
  );

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="container.md">
        <Box bg="white" borderRadius="2xl" shadow="xl">
          <VStack spacing={6} align="stretch" pt={8} pb={6}>
            <VStack spacing={2}>
              <Heading
                color="#181411"
                fontSize="28px"
                fontWeight="bold"
                textAlign="center"
              >
                パスワードをお忘れの方
              </Heading>
              <Text color="gray.600" fontSize="sm" textAlign="center">
                登録済みのメールアドレスを入力してください
              </Text>
            </VStack>

            <Box w={{ md: "100%", base: "90%" }} px={6} margin="auto">
              <VStack spacing={5}>
                {isSent ? (
                  <Alert
                    status="success"
                    borderRadius="md"
                    bg="green.50"
                    border="1px solid"
                    borderColor="green.200"
                  >
                    <AlertIcon color="green.500" />
                    <AlertDescription color="green.700" fontSize="sm">
                      パスワードリセット用のメールを送信しました。
                      メールに記載されたリンクからパスワードを再設定してください。
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <FormControl id="email" isInvalid={!!emailError}>
                      <FormLabel
                        fontSize="sm"
                        fontWeight="medium"
                        color="gray.700"
                        mb={2}
                      >
                        メールアドレス
                      </FormLabel>
                      <Input
                        placeholder="example@gmail.com"
                        bg="white"
                        border="2px solid"
                        borderColor={emailError ? "red.300" : "gray.200"}
                        _hover={{
                          borderColor: emailError ? "red.400" : "gray.300",
                        }}
                        _focus={{
                          borderColor: emailError ? "red.500" : "#887563",
                          boxShadow: emailError
                            ? "0 0 0 1px rgba(239, 68, 68, 0.2)"
                            : "0 0 0 1px rgba(136, 117, 99, 0.2)",
                        }}
                        _placeholder={{ color: "gray.400", fontSize: "sm" }}
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError("");
                        }}
                        onKeyPress={handleKeyPress}
                        transition="all 0.2s"
                        size="lg"
                      />
                      {emailError && (
                        <Text fontSize="xs" color="red.500" mt={1} ml={1}>
                          {emailError}
                        </Text>
                      )}
                    </FormControl>

                    <Box width="100%" pt={2}>
                      <Button
                        width="100%"
                        size="lg"
                        bg="#887563"
                        color="white"
                        _hover={{
                          bg: "#76654f",
                          transform: "translateY(-1px)",
                          boxShadow: "lg",
                        }}
                        _active={{
                          bg: "#65544a",
                          transform: "translateY(0)",
                        }}
                        onClick={handleSubmit}
                        isLoading={isLoading}
                        loadingText="送信中..."
                        transition="all 0.2s"
                        fontWeight="medium"
                        borderRadius="md"
                      >
                        リセットメールを送信
                      </Button>
                    </Box>
                  </>
                )}

                <VStack spacing={3} pt={2}>
                  <Text fontSize="sm" color="gray.600">
                    <Link
                      color="#887563"
                      fontWeight="medium"
                      ml={1}
                      _hover={{
                        color: "#76654f",
                        textDecoration: "underline",
                      }}
                      onClick={() => {
                        navigate(route.login);
                      }}
                      transition="color 0.2s"
                    >
                      ログイン画面に戻る
                    </Link>
                  </Text>
                </VStack>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
