import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  Button,
  Icon,
  Skeleton,
  useColorModeValue,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { FaCreditCard, FaEdit } from "react-icons/fa";
import { PaymentMethod, getPaymentMethods } from "../../api/paymentMethodApis";
import PaymentMethodModal from "./paymentMethodModal";
import useMyProfile from "../../hooks/useProfile";

const CreditCardSection: React.FC = () => {
  const { memorizeProfile } = useMyProfile();
  const toast = useToast();
  const [defaultCard, setDefaultCard] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textMuted = useColorModeValue("gray.600", "gray.400");

  const fetchDefaultCard = useCallback(async () => {
    setIsLoading(true);
    const paymentResponse = await getPaymentMethods(memorizeProfile.profile.id);

    console.log("creditCardSection paymentResponse", paymentResponse);

    if (paymentResponse.success) {
      const defaultMethod = paymentResponse.data.payment_methods.find(
        (m) => m.is_default
      );
      setDefaultCard(defaultMethod || null);

      // デバッグ情報の処理
      if (paymentResponse.data.debug_info) {
        console.log("creditCardSection debug_info:", paymentResponse.data.debug_info);

        if (paymentResponse.data.debug_info === "no_stripe_customer_id") {
          console.log("No stripe customer ID found - user needs to set up payment");
        } else if (paymentResponse.data.debug_info === "stripe_customer_deleted") {
          console.log("Stripe customer was deleted - user needs to add new card");
        }
      }

      // 支払い方法が見つからない場合のログ
      if (paymentResponse.data.payment_methods.length === 0) {
        console.log("No payment methods found for user");
      } else {
        console.log(`Found ${paymentResponse.data.payment_methods.length} payment methods`);
        console.log("Payment methods:", paymentResponse.data.payment_methods);
        if (!defaultMethod) {
          console.log("No default payment method found");
        }
      }
    } else {
      console.error("Payment methods fetch error:", paymentResponse.error);
      toast({
        title: "エラー",
        description: paymentResponse.error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setDefaultCard(null);
    }

    setIsLoading(false);
  }, [memorizeProfile.profile.id, toast]);

  useEffect(() => {
    fetchDefaultCard();
  }, [fetchDefaultCard]);

  // モーダルが閉じられたときに情報を更新
  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchDefaultCard();
  };

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

  console.log("defaultCard", defaultCard);

  return (
    <>
      <Box
        bg={bgColor}
        borderRadius="xl"
        p={6}
        boxShadow="sm"
        border="1px solid"
        borderColor={borderColor}
      >
        <HStack justify="space-between" mb={4}>
          <Text fontSize="lg" fontWeight="bold">
            お支払い方法
          </Text>
          <Button
            size="sm"
            colorScheme="orange"
            leftIcon={<FaEdit />}
            onClick={() => setIsModalOpen(true)}
          >
            管理
          </Button>
        </HStack>

        {isLoading ? (
          <VStack align="stretch" spacing={2}>
            <Skeleton height="20px" width="60%" />
            <Skeleton height="16px" width="40%" />
          </VStack>
        ) : defaultCard ? (
          <HStack spacing={3}>
            <Icon
              as={FaCreditCard}
              boxSize={8}
              color={getCardBrandColor(defaultCard.brand)}
            />
            <VStack align="start" spacing={0}>
              <HStack>
                <Text fontWeight="medium">
                  {defaultCard.brand.toUpperCase()} •••• {defaultCard.last4}
                </Text>
                <Badge colorScheme="blue" size="sm">
                  デフォルト
                </Badge>
              </HStack>
              <Text fontSize="sm" color={textMuted}>
                有効期限: {defaultCard.exp_month}/{defaultCard.exp_year}
              </Text>
            </VStack>
          </HStack>
        ) : (
          <VStack align="start" spacing={2}>
            <Text color={textMuted} fontSize="sm">
              お支払い方法が登録されていません。サブスクリプション決済情報を設定してください。
            </Text>
            <Button
              size="sm"
              colorScheme="orange"
              onClick={() => setIsModalOpen(true)}
            >
              カードを追加
            </Button>
          </VStack>
        )}
      </Box>

      <PaymentMethodModal isOpen={isModalOpen} onClose={handleModalClose} />
    </>
  );
};

export default CreditCardSection;
