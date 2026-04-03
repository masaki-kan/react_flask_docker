import { FC } from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Icon,
  Badge,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaHandshake,
  FaClipboardList,
  FaTruck,
  FaBoxOpen,
  FaCheckCircle,
  FaStar,
} from "react-icons/fa";

const HowItWorksSection: FC = () => {
  const MotionBox = motion.create(Box);

  const steps = [
    {
      icon: FaSearch,
      title: "商品を選ぶ",
      description:
        "気になる古着を見つけたら、詳細ページから「取引を申請する」をタップ。",
    },
    {
      icon: FaHandshake,
      title: "取引開始",
      description:
        "相手が承認したら取引スタート。交換したい商品を選択しましょう。",
    },
    {
      icon: FaClipboardList,
      title: "発送情報を入力",
      description: "配送会社と追跡番号を入力して、商品を発送します。",
    },
    {
      icon: FaTruck,
      title: "両者発送完了",
      description: "お互いに商品を発送したら、到着を待ちます。",
    },
    {
      icon: FaBoxOpen,
      title: "受取確認",
      description: "商品が届いたら、受取確認をタップします。",
    },
    {
      icon: FaCheckCircle,
      title: "取引を完了する",
      description: "お互いに受取確認が完了したら、取引を完了できます。",
    },
    {
      icon: FaStar,
      title: "取引完了",
      description: "取引が完了しました！また新しい古着を探しましょう。",
    },
  ];

  const color = "#e68019";

  return (
    <Box bg="#fdfcf8" py={16} px={4}>
      <VStack spacing={10} maxW="1000px" mx="auto">
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
          使い方の流れ
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%" pt={4}>
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
                  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                }}
                transition="all 0.3s"
              >
                <Box
                  bg={color}
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
      </VStack>
    </Box>
  );
};

export default HowItWorksSection;
