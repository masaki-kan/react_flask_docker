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
  Button,
  Alert,
  AlertIcon,
  AlertDescription,
  CloseButton,
  Collapse,
  Container,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { route } from "../../../route/routeConst";
import { useNavigate } from "react-router-dom";
import { loginApi, getLoginErrorMessage } from "../../../api/loginApis";
import { useAuth } from "../../../provider/authContext";

interface ErrorState {
  emailError: string;
  passwordError: string;
}

interface loginFormType {
  email: string;
  password: string;
}

const AdminLogin: FC = () => {
  const { isAdminLoggedIn, adminLogin } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>("");
  const [showError, setShowError] = useState(false);
  const [error, setError] = useState<ErrorState>({
    emailError: "",
    passwordError: "",
  });
  const [form, setForm] = useState<loginFormType>({
    email: "",
    password: "",
  });

  console.log("isAdminLoggedIn", isAdminLoggedIn);

  useEffect(() => {
    if (isAdminLoggedIn) {
      navigate(route.adminDashboard);
    }
  }, [isAdminLoggedIn, navigate]);

  // ログインエラーが設定されたら表示する
  useEffect(() => {
    if (loginError) {
      setShowError(true);
    }
  }, [loginError]);

  const loginClick = useCallback(async () => {
    const { email, password } = form;
    setIsLoading(true);
    setLoginError(""); // 前回のエラーをクリア
    setShowError(false);

    // バリデーションチェック
    const emailValid = validateEmail(email);
    const passwordValid = validatePassword(password);

    // エラーがあれば表示して終了
    setError({
      emailError: emailValid ? "" : "有効なメールアドレスを入力してください",
      passwordError: passwordValid
        ? ""
        : "パスワードは半角英数字で入力してください",
    });

    if (!emailValid || !passwordValid) {
      setIsLoading(false);
      return;
    }

    try {
      // ログインAPI実行
      const response = await loginApi(form);
      if (response && response.success) {
        adminLogin(
          response.data.username,
          response.data.token,
          response.data.userId,
          response.data.type
        );
        navigate(route.adminDashboard);
        return;
      } else {
        // ログイン失敗（401エラーなど）
        setLoginError("メールアドレスまたはパスワードが正しくありません");
      }
    } catch (error) {
      // APIエラーメッセージを取得
      const errorMessage = getLoginErrorMessage(error);
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [form, adminLogin, navigate]);

  const validatePassword = (password: string): boolean => {
    return /^[a-zA-Z0-9]+$/.test(password) && password.length <= 16;
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const formErrorCheckHanler = useCallback((value: string, type: string) => {
    // エラーメッセージをクリア
    setLoginError("");
    setShowError(false);

    if (type === "password") {
      if (!value) {
        setError((prev) => ({
          ...prev,
          passwordError: "パスワードは必須です",
        }));
      } else if (!validatePassword(value)) {
        setError((prev) => ({
          ...prev,
          passwordError: "パスワードは半角英数字16文字以下で入力してください",
        }));
      } else {
        setError((prev) => ({ ...prev, passwordError: "" }));
      }
    } else if (type === "email") {
      if (!value) {
        setError((prev) => ({
          ...prev,
          emailError: "メールアドレスは必須です",
        }));
      } else if (!validateEmail(value)) {
        setError((prev) => ({
          ...prev,
          emailError: "有効なメールアドレスを入力してください",
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

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && form.email && form.password) {
        loginClick();
      }
    },
    [form.email, form.password, loginClick]
  );

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="container.md">
        {/* デコレーティブな背景要素 */}
        <Box bg="white" borderRadius="2xl" shadow="xl">
          <VStack spacing={6} align="stretch" pt={8} pb={6}>
            <VStack spacing={2}>
              <Heading
                color="#181411"
                fontSize="28px"
                fontWeight="bold"
                textAlign="center"
              >
                管理者専用
              </Heading>
            </VStack>

            <Box w={{ md: "100%", base: "90%" }} px={6} margin="auto">
              <VStack spacing={5}>
                {/* ログインエラーメッセージ */}
                <Collapse
                  in={showError}
                  animateOpacity
                  style={{ width: "100%" }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert
                      status="error"
                      borderRadius="md"
                      mb={4}
                      fontSize="sm"
                      bg="red.50"
                      border="1px solid"
                      borderColor="red.200"
                    >
                      <AlertIcon color="red.500" />
                      <AlertDescription flex="1" color="red.700">
                        {loginError}
                      </AlertDescription>
                      <CloseButton
                        size="sm"
                        onClick={() => {
                          setShowError(false);
                          setLoginError("");
                        }}
                        color="red.500"
                        _hover={{ color: "red.700" }}
                      />
                    </Alert>
                  </motion.div>
                </Collapse>

                <FormControl id="email" isInvalid={!!error.emailError}>
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
                    borderColor={error.emailError ? "red.300" : "gray.200"}
                    _hover={{
                      borderColor: error.emailError ? "red.400" : "gray.300",
                    }}
                    _focus={{
                      borderColor: error.emailError ? "red.500" : "#887563",
                      boxShadow: error.emailError
                        ? "0 0 0 1px rgba(239, 68, 68, 0.2)"
                        : "0 0 0 1px rgba(136, 117, 99, 0.2)",
                    }}
                    _placeholder={{ color: "gray.400", fontSize: "sm" }}
                    type="email"
                    value={form.email}
                    onChange={updateFormHandler}
                    onKeyPress={handleKeyPress}
                    transition="all 0.2s"
                    size="lg"
                  />
                  {error.emailError && (
                    <Text fontSize="xs" color="red.500" mt={1} ml={1}>
                      {error.emailError}
                    </Text>
                  )}
                </FormControl>

                <FormControl id="password" isInvalid={!!error.passwordError}>
                  <HStack justify="space-between" mb={2}>
                    <FormLabel
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.700"
                      mb={0}
                    >
                      パスワード
                    </FormLabel>
                    <Text fontSize="xs" color="gray.500">
                      半角英数字16文字以下
                    </Text>
                  </HStack>
                  <Input
                    placeholder="パスワードを入力"
                    bg="white"
                    border="2px solid"
                    borderColor={error.passwordError ? "red.300" : "gray.200"}
                    _hover={{
                      borderColor: error.passwordError ? "red.400" : "gray.300",
                    }}
                    _focus={{
                      borderColor: error.passwordError ? "red.500" : "#887563",
                      boxShadow: error.passwordError
                        ? "0 0 0 1px rgba(239, 68, 68, 0.2)"
                        : "0 0 0 1px rgba(136, 117, 99, 0.2)",
                    }}
                    _placeholder={{ color: "gray.400", fontSize: "sm" }}
                    type="password"
                    value={form.password}
                    onChange={updateFormHandler}
                    onKeyPress={handleKeyPress}
                    transition="all 0.2s"
                    size="lg"
                  />
                  {error.passwordError && (
                    <Text fontSize="xs" color="red.500" mt={1} ml={1}>
                      {error.passwordError}
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
                    onClick={loginClick}
                    isLoading={isLoading}
                    loadingText="ログイン中..."
                    transition="all 0.2s"
                    fontWeight="medium"
                    borderRadius="md"
                  >
                    ログイン
                  </Button>
                </Box>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminLogin;
