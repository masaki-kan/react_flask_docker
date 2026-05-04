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
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPasswordApi } from "../../api/loginApis";

const ResetPassword: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = useCallback(async () => {
    let hasError = false;
    setPasswordError("");
    setConfirmError("");
    setApiError("");

    if (!newPassword) {
      setPasswordError("パスワードを入力してください");
      hasError = true;
    } else if (newPassword.length < 8) {
      setPasswordError("パスワードは8文字以上で入力してください");
      hasError = true;
    } else if (!/^[a-zA-Z0-9]+$/.test(newPassword)) {
      setPasswordError("パスワードは半角英数字で入力してください");
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmError("確認用パスワードを入力してください");
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      setConfirmError("パスワードが一致しません");
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    const response = await resetPasswordApi(token || "", newPassword);
    setIsLoading(false);

    if (response.success) {
      setIsSuccess(true);
    } else {
      setApiError(response.error || "パスワードの再設定に失敗しました");
    }
  }, [newPassword, confirmPassword, token]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && newPassword && confirmPassword) {
        handleSubmit();
      }
    },
    [newPassword, confirmPassword, handleSubmit],
  );

  // トークンがない場合
  if (!token) {
    return (
      <Box minH="100vh" bg="gray.50" py={8}>
        <Container maxW="container.md">
          <Box bg="white" borderRadius="2xl" shadow="xl">
            <VStack spacing={6} align="stretch" pt={8} pb={6} px={6}>
              <Alert
                status="error"
                borderRadius="md"
                bg="red.50"
                border="1px solid"
                borderColor="red.200"
              >
                <AlertIcon color="red.500" />
                <AlertDescription color="red.700" fontSize="sm">
                  無効なリセットリンクです。再度パスワードリセットを申請してください。
                </AlertDescription>
              </Alert>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                <Link
                  color="#887563"
                  fontWeight="medium"
                  _hover={{
                    color: "#76654f",
                    textDecoration: "underline",
                  }}
                  onClick={() => navigate(route.forgotPassword)}
                  transition="color 0.2s"
                >
                  パスワードリセットを申請する
                </Link>
              </Text>
            </VStack>
          </Box>
        </Container>
      </Box>
    );
  }

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
                パスワード再設定
              </Heading>
              <Text color="gray.600" fontSize="sm" textAlign="center">
                新しいパスワードを入力してください
              </Text>
            </VStack>

            <Box w={{ md: "100%", base: "90%" }} px={6} margin="auto">
              <VStack spacing={5}>
                {isSuccess ? (
                  <>
                    <Alert
                      status="success"
                      borderRadius="md"
                      bg="green.50"
                      border="1px solid"
                      borderColor="green.200"
                    >
                      <AlertIcon color="green.500" />
                      <AlertDescription color="green.700" fontSize="sm">
                        パスワードが正常に変更されました。新しいパスワードでログインしてください。
                      </AlertDescription>
                    </Alert>
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
                        onClick={() => navigate(route.login)}
                        transition="all 0.2s"
                        fontWeight="medium"
                        borderRadius="md"
                      >
                        ログイン画面へ
                      </Button>
                    </Box>
                  </>
                ) : (
                  <>
                    {apiError && (
                      <Alert
                        status="error"
                        borderRadius="md"
                        bg="red.50"
                        border="1px solid"
                        borderColor="red.200"
                      >
                        <AlertIcon color="red.500" />
                        <AlertDescription color="red.700" fontSize="sm">
                          {apiError}
                        </AlertDescription>
                      </Alert>
                    )}

                    <FormControl isInvalid={!!passwordError}>
                      <FormLabel
                        fontSize="sm"
                        fontWeight="medium"
                        color="gray.700"
                        mb={2}
                      >
                        新しいパスワード
                      </FormLabel>
                      <Input
                        placeholder="8文字以上の半角英数字"
                        bg="white"
                        border="2px solid"
                        borderColor={passwordError ? "red.300" : "gray.200"}
                        _hover={{
                          borderColor: passwordError ? "red.400" : "gray.300",
                        }}
                        _focus={{
                          borderColor: passwordError ? "red.500" : "#887563",
                          boxShadow: passwordError
                            ? "0 0 0 1px rgba(239, 68, 68, 0.2)"
                            : "0 0 0 1px rgba(136, 117, 99, 0.2)",
                        }}
                        _placeholder={{ color: "gray.400", fontSize: "sm" }}
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordError("");
                          setApiError("");
                        }}
                        onKeyPress={handleKeyPress}
                        transition="all 0.2s"
                        size="lg"
                      />
                      {passwordError && (
                        <Text fontSize="xs" color="red.500" mt={1} ml={1}>
                          {passwordError}
                        </Text>
                      )}
                    </FormControl>

                    <FormControl isInvalid={!!confirmError}>
                      <FormLabel
                        fontSize="sm"
                        fontWeight="medium"
                        color="gray.700"
                        mb={2}
                      >
                        パスワード確認
                      </FormLabel>
                      <Input
                        placeholder="パスワードを再入力"
                        bg="white"
                        border="2px solid"
                        borderColor={confirmError ? "red.300" : "gray.200"}
                        _hover={{
                          borderColor: confirmError ? "red.400" : "gray.300",
                        }}
                        _focus={{
                          borderColor: confirmError ? "red.500" : "#887563",
                          boxShadow: confirmError
                            ? "0 0 0 1px rgba(239, 68, 68, 0.2)"
                            : "0 0 0 1px rgba(136, 117, 99, 0.2)",
                        }}
                        _placeholder={{ color: "gray.400", fontSize: "sm" }}
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setConfirmError("");
                          setApiError("");
                        }}
                        onKeyPress={handleKeyPress}
                        transition="all 0.2s"
                        size="lg"
                      />
                      {confirmError && (
                        <Text fontSize="xs" color="red.500" mt={1} ml={1}>
                          {confirmError}
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
                        loadingText="変更中..."
                        transition="all 0.2s"
                        fontWeight="medium"
                        borderRadius="md"
                      >
                        パスワードを変更する
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
                      onClick={() => navigate(route.login)}
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

export default ResetPassword;
