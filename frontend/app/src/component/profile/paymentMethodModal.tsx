import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Box,
  Icon,
  Badge,
  IconButton,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Divider,
  useColorModeValue,
  FormLabel,
  FormControl,
} from "@chakra-ui/react";
import { FaCreditCard, FaTrash, FaPlus, FaCheck } from "react-icons/fa";
import {
  Elements,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import {
  PaymentMethod,
  getPaymentMethods,
  deletePaymentMethod,
} from "../../api/paymentMethodApis";
import useMyProfile from "../../hooks/useProfile";
import { stripePromise } from "../../consts/stripe";
import useCredit from "../../hooks/useCredit";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// カードブランドのアイコンカラー
const getCardBrandColor = (brand: string) => {
  switch (brand.toLowerCase()) {
    case "visa":
      return "blue.500";
    case "mastercard":
      return "orange.500";
    case "amex":
      return "green.500";
    case "discover":
      return "purple.500";
    default:
      return "gray.500";
  }
};

// カード追加フォームコンポーネント
const AddCardForm: React.FC<{
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ onSuccess, onCancel }) => {
  const { createSetupIntentHandler } = useCredit();
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>("");
  const { memorizeProfile } = useMyProfile();

  useEffect(() => {
    // SetupIntentを作成
    const fetchSetupIntent = async () => {
      const result = await createSetupIntentHandler(memorizeProfile.profile.id);
      if (result) {
        setClientSecret(result.clientSecret);
      }
    };
    fetchSetupIntent();
  }, [createSetupIntentHandler, memorizeProfile.profile.id]);

  const handleSubmit = async () => {
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);

    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);
    if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
      setIsLoading(false);
      toast({
        title: "エラー",
        description: "カード情報の入力に問題があります",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    try {
      // まず、支払い方法を作成
      const { error: methodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardNumberElement,
          billing_details: {
            name: memorizeProfile.profile.name,
            email: memorizeProfile.profile.email,
          },
        });

      if (methodError) {
        throw methodError;
      }

      // SetupIntentを確認
      const { error, setupIntent } = await stripe.confirmCardSetup(
        clientSecret,
        {
          payment_method: paymentMethod?.id,
        }
      );

      if (error) {
        throw error;
      } else if (setupIntent?.status === "succeeded") {
        toast({
          title: "成功",
          description: "新しいカードを追加しました",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onSuccess();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "カードの追加に失敗しました";
      toast({
        title: "エラー",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
    hidePostalCode: true, // 郵便番号フィールドを非表示
  };

  return (
    <VStack spacing={4} align="stretch">
      <Box p={4} borderWidth={1} borderRadius="md" borderColor="gray.200">
        <VStack spacing={4}>
          <FormControl>
            <FormLabel fontSize={"sm"}>カード番号</FormLabel>
            <Box p={3} borderWidth={1} borderRadius="md">
              <CardNumberElement options={cardElementOptions} />
            </Box>
          </FormControl>

          <HStack spacing={2} justifyContent={"space-around"} w={"100%"}>
            <FormControl flex={1}>
              <FormLabel fontSize={"sm"}>有効期限</FormLabel>
              <Box p={3} borderWidth={1} borderRadius="md">
                <CardExpiryElement options={cardElementOptions} />
              </Box>
            </FormControl>

            <FormControl flex={1}>
              <FormLabel fontSize={"sm"}>セキュリティコード</FormLabel>
              <Box p={3} borderWidth={1} borderRadius="md">
                <CardCvcElement options={cardElementOptions} />
              </Box>
            </FormControl>
          </HStack>
        </VStack>
      </Box>
      <HStack justify="flex-end" spacing={2}>
        <Button variant="ghost" onClick={onCancel} isDisabled={isLoading}>
          キャンセル
        </Button>
        <Button
          type="submit"
          colorScheme="orange"
          isLoading={isLoading}
          isDisabled={!stripe || !clientSecret}
          loadingText="処理中..."
          onClick={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          カードを追加
        </Button>
      </HStack>
    </VStack>
  );
};

// メインのモーダルコンポーネント
const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isDeletingCard, setIsDeletingCard] = useState<string | null>(null);
  const toast = useToast();
  const { updateDefaultPayment } = useCredit();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const { memorizeProfile } = useMyProfile();

  const fetchPaymentMethods = useCallback(async () => {
    setIsLoading(true);
    const paymentResponse = await getPaymentMethods(memorizeProfile.profile.id);

    if (paymentResponse.success) {
      setPaymentMethods(paymentResponse.data.payment_methods);

      // デバッグ情報がある場合は表示
      if (paymentResponse.data.debug_info) {
        if (paymentResponse.data.debug_info === "no_stripe_customer_id") {
          toast({
            title: "情報",
            description:
              "サブスクリプション情報が見つかりません。新しくカードを追加してください。",
            status: "info",
            duration: 7000,
            isClosable: true,
          });
        } else if (
          paymentResponse.data.debug_info === "stripe_customer_deleted"
        ) {
          toast({
            title: "情報",
            description:
              "以前の決済情報が無効になっています。新しくカードを追加してください。",
            status: "warning",
            duration: 7000,
            isClosable: true,
          });
        }
      }
    } else {
      // console.error("Payment methods fetch error:", paymentResponse.error);
      toast({
        title: "エラー",
        description: paymentResponse.error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }

    setIsLoading(false);
  }, [memorizeProfile.profile.id, toast]);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [fetchPaymentMethods, isOpen]);

  const handleSetDefault = useCallback(
    async (paymentMethodId: string) => {
      if (
        await updateDefaultPayment(memorizeProfile.profile.id, paymentMethodId)
      ) {
        toast({
          title: "成功",
          description: "デフォルトのカードを変更しました",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchPaymentMethods();
      } else {
        toast({
          title: "エラー",
          description: "デフォルトカードの変更に失敗しました",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [
      fetchPaymentMethods,
      memorizeProfile.profile.id,
      toast,
      updateDefaultPayment,
    ]
  );

  const handleDelete = useCallback(
    async (paymentMethodId: string) => {
      setIsDeletingCard(paymentMethodId);
      const result = await deletePaymentMethod(
        memorizeProfile.profile.id,
        paymentMethodId
      );

      if (result.success) {
        toast({
          title: "成功",
          description: "カードを削除しました",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchPaymentMethods();
      } else {
        toast({
          title: "エラー",
          description: result.error || "カードの削除に失敗しました",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
      setIsDeletingCard(null);
    },
    [fetchPaymentMethods, memorizeProfile.profile.id, toast]
  );

  const handleAddCardSuccess = () => {
    setIsAddingCard(false);
    fetchPaymentMethods();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>クレジットカード管理</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <Center py={10}>
              <Spinner size="lg" />
            </Center>
          ) : (
            <VStack spacing={4} align="stretch">
              {paymentMethods.length === 0 && !isAddingCard && (
                <Alert status="info">
                  <AlertIcon />
                  登録されているカードがありません。新しいカードを追加してください。
                </Alert>
              )}

              {paymentMethods.map((method) => (
                <Box
                  key={method.id}
                  p={4}
                  borderWidth={1}
                  borderRadius="lg"
                  borderColor={method.is_default ? "blue.500" : borderColor}
                  bg={bgColor}
                  position="relative"
                >
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      <Icon
                        as={FaCreditCard}
                        boxSize={6}
                        color={getCardBrandColor(method.brand)}
                      />
                      <VStack align="start" spacing={0}>
                        <HStack>
                          <Text fontWeight="bold">
                            {method.brand.toUpperCase()} •••• {method.last4}
                          </Text>
                          {method.is_default && (
                            <Badge colorScheme="blue" size="sm">
                              デフォルト
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          有効期限: {method.exp_month}/{method.exp_year}
                        </Text>
                      </VStack>
                    </HStack>
                    <HStack spacing={2}>
                      {!method.is_default && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetDefault(method.id)}
                          leftIcon={<FaCheck />}
                        >
                          デフォルトに設定
                        </Button>
                      )}
                      {paymentMethods.length > 1 && (
                        <IconButton
                          aria-label="Delete card"
                          icon={<FaTrash />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDelete(method.id)}
                          isLoading={isDeletingCard === method.id}
                        />
                      )}
                    </HStack>
                  </HStack>
                </Box>
              ))}

              <Divider />

              {isAddingCard ? (
                <Elements stripe={stripePromise}>
                  <AddCardForm
                    onSuccess={handleAddCardSuccess}
                    onCancel={() => setIsAddingCard(false)}
                  />
                </Elements>
              ) : (
                <Button
                  leftIcon={<FaPlus />}
                  onClick={() => setIsAddingCard(true)}
                  variant="outline"
                  w="full"
                >
                  新しいカードを追加
                </Button>
              )}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            閉じる
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PaymentMethodModal;
