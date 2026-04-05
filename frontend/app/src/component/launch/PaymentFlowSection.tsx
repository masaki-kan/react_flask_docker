import { FC } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  Badge,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaCreditCard,
  FaUniversity,
  FaHandshake,
  FaTruck,
  FaCheckCircle,
  FaShieldAlt,
} from "react-icons/fa";

const PaymentFlowSection: FC = () => {
  const MotionBox = motion.create(Box);

  const cardSteps = [
    {
      icon: FaHandshake,
      title: "価格の合意",
      description: "チャットで販売価格を提示し、双方が合意します。",
    },
    {
      icon: FaCreditCard,
      title: "カード決済",
      description:
        "クレジットカードで即時決済。代金はプラットフォームが一時預かりします。",
    },
    {
      icon: FaTruck,
      title: "商品の発送・受取",
      description: "出品者が商品を発送し、購入者が受取確認を行います。",
    },
    {
      icon: FaCheckCircle,
      title: "取引完了・入金",
      description: "受取確認後、出品者へ売上金が入金されます。",
    },
  ];

  const bankSteps = [
    {
      icon: FaHandshake,
      title: "価格の合意",
      description: "チャットで販売価格を提示し、双方が合意します。",
    },
    {
      icon: FaUniversity,
      title: "銀行振込",
      description:
        "表示される振込先口座に代金を振り込みます。手数料がカード決済よりお得です。",
    },
    {
      icon: FaTruck,
      title: "商品の発送・受取",
      description:
        "入金確認後、出品者が商品を発送し、購入者が受取確認を行います。",
    },
    {
      icon: FaCheckCircle,
      title: "取引完了・入金",
      description: "受取確認後、出品者へ売上金が入金されます。",
    },
  ];

  const renderSteps = (
    steps: typeof cardSteps,
    color: string,
    bgGradient: string,
  ) => (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
      {steps.map((step, index) => (
        <MotionBox
          key={index}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <HStack
            bg="white"
            p={4}
            borderRadius="lg"
            boxShadow="0 2px 12px rgba(0,0,0,0.06)"
            align="start"
            spacing={4}
            _hover={{
              transform: "translateY(-4px)",
              boxShadow: `0 6px 20px rgba(0,0,0,0.1)`,
            }}
            transition="all 0.3s"
          >
            <Box
              bg={bgGradient}
              borderRadius="full"
              w="44px"
              h="44px"
              minW="44px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
            >
              <Icon as={step.icon} color="white" boxSize={5} />
              <Badge
                position="absolute"
                top="-6px"
                right="-6px"
                bg={color}
                color="white"
                borderRadius="full"
                fontSize="xs"
                w="20px"
                h="20px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {index + 1}
              </Badge>
            </Box>
            <Box>
              <Text fontWeight="bold" fontSize="sm" color="#1C160C" mb={1}>
                {step.title}
              </Text>
              <Text fontSize="xs" color="#666" lineHeight="tall">
                {step.description}
              </Text>
            </Box>
          </HStack>
        </MotionBox>
      ))}
    </SimpleGrid>
  );

  return (
    <Box bg="#fdfcf8" py={16} px={4}>
      <VStack spacing={10} maxW="1000px" mx="auto">
        <VStack spacing={3}>
          <Heading
            fontSize={{ base: "2xl", md: "3xl" }}
            color="#9b5a37"
            fontWeight="bold"
            textAlign="center"
            position="relative"
            _after={{
              content: '""',
              position: "absolute",
              bottom: "-12px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "80px",
              height: "4px",
              bg: "#e68019",
              borderRadius: "full",
            }}
            pb={4}
          >
            お支払いの流れ
          </Heading>
          <Text fontSize="sm" color="#A18249" textAlign="center" pt={4}>
            安心・安全なエスクロー決済で、代金はプラットフォームが一時預かりします。
          </Text>
        </VStack>

        {/* 安心ポイント */}
        <HStack
          bg="white"
          borderRadius="xl"
          px={6}
          py={4}
          boxShadow="0 2px 12px rgba(0,0,0,0.06)"
          spacing={3}
        >
          <Icon as={FaShieldAlt} color="#e68019" boxSize={5} />
          <Text fontSize="xs" color="#666" lineHeight="tall">
            購入者が受取確認をするまで、代金はプラットフォームが安全にお預かりします。商品が届かないなどのトラブル時も安心です。
          </Text>
        </HStack>

        {/* カード決済フロー */}
        <Box w="100%">
          <HStack mb={4} spacing={3}>
            <Icon as={FaCreditCard} color="#e68019" boxSize={5} />
            <Heading fontSize="lg" color="#1C160C">
              カード決済
            </Heading>
            <Badge colorScheme="orange" fontSize="xs">
              即時決済
            </Badge>
          </HStack>
          {renderSteps(cardSteps, "#e68019", "#e68019")}
        </Box>

        {/* 銀行振込フロー */}
        <Box w="100%">
          <HStack mb={4} spacing={3}>
            <Icon as={FaUniversity} color="#9b5a37" boxSize={5} />
            <Heading fontSize="lg" color="#1C160C">
              銀行振込
            </Heading>
            <Badge colorScheme="green" fontSize="xs">
              手数料がお得
            </Badge>
          </HStack>
          {renderSteps(bankSteps, "#9b5a37", "#9b5a37")}
        </Box>
      </VStack>
    </Box>
  );
};

export default PaymentFlowSection;
