import { FC } from "react";
import {
  Box,
  Heading,
  Flex,
  SimpleGrid,
  Text,
  VStack,
  Image,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const HowItWorksSection: FC = () => {
  const MotionBox = motion.create(Box);

  const steps = [
    {
      image: "/launch/01-item-detail.png",
      alt: "商品を選ぶ",
      title: "商品を選ぶ",
      description:
        "気になる古着を見つけたら、詳細ページから「取引を申請する」をタップ。",
    },
    {
      image: "/launch/02-trade-started.png",
      alt: "取引開始",
      title: "取引開始",
      description:
        "相手が承認したら取引スタート。交換したい商品を選択しましょう。",
    },
    {
      image: "/launch/03-shipping-info-input.png",
      alt: "発送情報を入力",
      title: "発送情報を入力",
      description: "配送会社と追跡番号を入力して、商品を発送します。",
    },
    {
      image: "/launch/04-both-shipped.png",
      alt: "両者発送完了",
      title: "両者発送完了",
      description: "お互いに商品を発送したら、到着を待ちます。",
    },
    {
      image: "/launch/05-received-confirmed.png",
      alt: "受取確認",
      title: "受取確認",
      description: "商品が届いたら、受取確認をタップします。",
    },
    {
      image: "/launch/06-complete-trade-active.png",
      alt: "取引を完了する",
      title: "取引を完了する",
      description: "お互いに受取確認が完了したら、取引を完了できます。",
    },
    {
      image: "/launch/07-trade-completed.png",
      alt: "取引完了",
      title: "取引完了",
      description: "取引が完了しました！また新しい古着を探しましょう。",
    },
  ];

  return (
    <Box bg="#fdfcf8" py={16} px={4}>
      <VStack spacing={8} maxW="1200px" mx="auto">
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

        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3 }}
          spacing={8}
          w="100%"
          pt={8}
        >
          {steps.map((step, index) => (
            <MotionBox
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <VStack
                bg="white"
                borderRadius="xl"
                overflow="hidden"
                boxShadow="0 4px 20px rgba(0,0,0,0.08)"
                _hover={{
                  transform: "translateY(-8px)",
                  boxShadow: "0 8px 30px rgba(230, 128, 25, 0.15)",
                }}
                transition="all 0.3s"
              >
                <Image
                  src={step.image}
                  alt={step.alt}
                  h="400px"
                  w={"53%"}
                  border={"1px solid #ccc"}
                  objectFit="cover"
                />
                <Box p={6} w="100%">
                  <Flex align="center" mb={3}>
                    <Box
                      bg="#e68019"
                      color="white"
                      borderRadius="full"
                      w="32px"
                      h="32px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="bold"
                      mr={3}
                    >
                      {index + 1}
                    </Box>
                    <Text fontSize="lg" fontWeight="bold" color="#1C160C">
                      {step.title}
                    </Text>
                  </Flex>
                  <Text fontSize="sm" color="#666" lineHeight="tall">
                    {step.description}
                  </Text>
                </Box>
              </VStack>
            </MotionBox>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default HowItWorksSection;
