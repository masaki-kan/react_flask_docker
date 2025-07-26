// pages/archive/components/ArchiveChat.tsx
import { FC } from "react";
import { VStack, HStack, Text, Avatar, Card } from "@chakra-ui/react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { archiveMessage } from "../../types/archiveTradeType";

interface ArchiveChatProps {
  messages: archiveMessage[];
}

const ArchiveChat: FC<ArchiveChatProps> = ({ messages }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MM/dd HH:mm", { locale: ja });
    } catch {
      return "";
    }
  };

  return (
    <Card
      borderWidth={1}
      borderColor="gray.200"
      bg="gray.50"
      h="400px"
      overflowY="auto"
      p={4}
    >
      <VStack spacing={3} align="stretch">
        {messages.map((msg, index) => (
          <HStack
            key={index}
            w="100%"
            justifyContent="flex-start"
            align="start"
          >
            <Avatar
              size="sm"
              src={msg.sender_profile_image_at_archive}
              name={msg.sender_name}
            />
            <VStack align="start" flex={1} spacing={1}>
              <HStack>
                <Text fontSize="xs" fontWeight="bold">
                  {msg.sender_name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {formatDate(msg.sent_at)}
                </Text>
              </HStack>
              <Text
                fontSize="sm"
                p={2}
                borderRadius="lg"
                bg="white"
                maxW="100%"
                whiteSpace="pre-wrap"
              >
                {msg.message}
              </Text>
            </VStack>
          </HStack>
        ))}
      </VStack>
    </Card>
  );
};

export default ArchiveChat;
