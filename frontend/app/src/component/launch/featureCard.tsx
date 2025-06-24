import { Flex, Icon, VStack, Text } from "@chakra-ui/react";
import { FC } from "react";
import { IconType } from "react-icons";

type FeatureCardType = {
  icon: IconType;
  title: string;
  desc: string;
};

const FeatureCard: FC<FeatureCardType> = ({ icon, title, desc }) => {
  return (
    <>
      <Flex
        flexDir="column"
        p={4}
        border="1px solid #E9DFCE"
        borderRadius="lg"
        bg="white"
        gap={3}
      >
        <Icon as={icon} boxSize={6} color="#1C160C" />
        <VStack align="start" spacing={1}>
          <Text fontWeight="bold" fontSize="md" color="#1C160C">
            {title}
          </Text>
          <Text fontSize="sm" color="#A18249">
            {desc}
          </Text>
        </VStack>
      </Flex>
    </>
  );
};

export default FeatureCard;
