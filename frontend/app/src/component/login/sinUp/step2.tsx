import {
  VStack,
  Box,
  Heading,
  HStack,
  Icon,
  Button,
  SimpleGrid,
  Text,
  Badge,
} from "@chakra-ui/react";
import { FC } from "react";
import { FaCheck, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { sinupFormType, plansType } from "../../../types/loginType";

type Step2Type = {
  formData: sinupFormType;
  setFormData: (value: React.SetStateAction<sinupFormType>) => void;
  nextStep: () => Promise<void>;
  prevStep: () => void;
  loading: boolean;
  plans: plansType[];
};

const Step2: FC<Step2Type> = ({
  setFormData,
  formData,
  nextStep,
  prevStep,
  loading,
  plans,
}) => {
  return (
    <>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            プランを選択
          </Heading>
          <Text color="gray.600">
            お好きなプランを選んで、今すぐスタートしましょう！
          </Text>
          <Text fontSize="sm" color="orange.600" mt={1}>
            初月はどちらのプランも無料でご利用いただけます
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {plans.map((plan) => (
            <Box
              key={plan.id}
              position="relative"
              borderWidth={2}
              borderColor={
                formData.plan === plan.id ? "orange.500" : "gray.200"
              }
              borderRadius="xl"
              p={6}
              cursor="pointer"
              onClick={() => setFormData({ ...formData, plan: plan.id })}
              bg={formData.plan === plan.id ? "orange.50" : "white"}
              _hover={{ shadow: "md" }}
              transition="all 0.2s"
            >
              {plan.recommended && (
                <Badge
                  position="absolute"
                  top={-3}
                  right={-2}
                  colorScheme="red"
                  px={3}
                  py={1}
                  borderRadius="full"
                  transform="rotate(12deg)"
                >
                  おすすめ！
                </Badge>
              )}

              <VStack align="start" spacing={4}>
                <Badge colorScheme={plan.color}>{plan.badge}</Badge>

                <Box>
                  <Heading size="md">{plan.name}</Heading>
                  <Text fontSize="sm" color="gray.500">
                    {plan.description}
                  </Text>
                </Box>

                <HStack align="baseline">
                  <Text fontSize="3xl" fontWeight="bold">
                    {plan.price}
                  </Text>
                  <Text color="gray.500">{plan.period}</Text>
                </HStack>

                {plan.save && (
                  <Badge colorScheme="green" fontSize="sm" p={2}>
                    {plan.save}
                  </Badge>
                )}

                <VStack align="start" spacing={2}>
                  {plan.features.map((feature, index) => (
                    <HStack key={index} spacing={2}>
                      <Icon as={FaCheck} color="green.500" />
                      <Text fontSize="sm">{feature}</Text>
                    </HStack>
                  ))}
                </VStack>
              </VStack>

              {formData.plan === plan.id && (
                <Box position="absolute" top={3} right={3}>
                  <Icon as={FaCheck} color="orange.500" boxSize={6} />
                </Box>
              )}
            </Box>
          ))}
        </SimpleGrid>

        <HStack spacing={3}>
          <Button
            flex={1}
            size="lg"
            variant="outline"
            onClick={prevStep}
            leftIcon={<FaChevronLeft />}
          >
            戻る
          </Button>
          <Button
            flex={2}
            colorScheme="orange"
            size="lg"
            onClick={nextStep}
            rightIcon={<FaChevronRight />}
            isLoading={loading}
          >
            次へ進む
          </Button>
        </HStack>
      </VStack>
    </>
  );
};

export default Step2;
