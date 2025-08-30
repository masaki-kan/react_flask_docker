// components/profile/CreditCardSection.tsx
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

    if (paymentResponse.success) {
      const defaultMethod = paymentResponse.data.payment_methods.find(
        (m) => m.is_default
      );
      setDefaultCard(defaultMethod || null);
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
            leftIcon={<FaEdit />}
            onClick={() => setIsModalOpen(true)}
            variant="outline"
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
              お支払い方法が登録されていません
            </Text>
            <Button
              size="sm"
              colorScheme="blue"
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
