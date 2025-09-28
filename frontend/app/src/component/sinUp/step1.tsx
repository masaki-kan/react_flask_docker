import {
  VStack,
  Box,
  Heading,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  Button,
  Text,
  Checkbox,
  Link,
} from "@chakra-ui/react";
import { FC, useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEyeSlash,
  FaEye,
  FaChevronRight,
} from "react-icons/fa";
import { errorStateType, sinupFormType } from "../../types/loginType";

type Step1Type = {
  errors: errorStateType;
  formData: sinupFormType;
  setFormData: (value: React.SetStateAction<sinupFormType>) => void;
  nextStep: () => Promise<void>;
};

// ステップ1: 基本情報
const Step1: FC<Step1Type> = ({ errors, formData, setFormData, nextStep }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="lg" mb={2}>
          アカウントを作成
        </Heading>
        <Text color="gray.600">まずは基本情報を入力してください</Text>
      </Box>

      <VStack spacing={4}>
        <FormControl isInvalid={!!errors.username}>
          <FormLabel>
            <HStack spacing={2}>
              <Icon as={FaUser} />
              <Text>氏名</Text>
            </HStack>
          </FormLabel>
          <Input
            placeholder="山田 太郎"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            size="lg"
          />
          <FormErrorMessage>{errors.username}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.email}>
          <FormLabel>
            <HStack spacing={2}>
              <Icon as={FaEnvelope} />
              <Text>メールアドレス</Text>
            </HStack>
          </FormLabel>
          <Input
            type="email"
            placeholder="taro@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            size="lg"
          />
          <FormErrorMessage>{errors.email}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.password}>
          <FormLabel>
            <HStack spacing={2}>
              <Icon as={FaLock} />
              <Text>パスワード</Text>
            </HStack>
          </FormLabel>
          <Text fontSize="xs" color="gray.500" mb={2}>
            半角英数字かつ8文字以上16文字以下
          </Text>
          <InputGroup size="lg">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="パスワードを入力"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <InputRightElement>
              <Button
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                variant="ghost"
              >
                <Icon as={showPassword ? FaEyeSlash : FaEye} />
              </Button>
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        </FormControl>
      </VStack>

      {/* 利用規約同意チェックボックス */}
      <Box>
        <Checkbox
          isChecked={formData.agreeToTerms}
          onChange={(e) =>
            setFormData({ ...formData, agreeToTerms: e.target.checked })
          }
          colorScheme="orange"
        >
          <Text fontSize="sm">
            <Link
              href="/terms"
              color="orange.500"
              textDecoration="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              利用規約
            </Link>
            および
            <Link
              href="/privacy"
              color="orange.500"
              textDecoration="underline"
              target="_blank"
              rel="noopener noreferrer"
              ml={1}
            >
              プライバシーポリシー
            </Link>
            に同意します
          </Text>
        </Checkbox>
      </Box>

      <Button
        colorScheme="orange"
        size="lg"
        onClick={nextStep}
        rightIcon={<FaChevronRight />}
        isDisabled={!formData.agreeToTerms}
      >
        次へ進む
      </Button>
    </VStack>
  );
};

export default Step1;
