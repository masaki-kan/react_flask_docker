import { ChangeEvent, FC, KeyboardEvent, useState } from "react";
import MainHeader from "../common/layout/mainHeader";
import Side from "../common/layout/side";
import {
  Input,
  Button,
  VStack,
  HStack,
  Text,
  Container,
  Flex,
  Avatar,
} from "@chakra-ui/react";

const ChatLayout: FC = () => {
  const [messages, setMessages] = useState<
    {
      avatar: string;
      text: string;
      position: string;
      date: Date;
      id: number;
      userId: number;
    }[]
  >([]);
  const [messageText, setMessageText] = useState("");

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage = {
        avatar: "https://avatars.githubusercontent.com/u/80540635?v=4",
        position: "right", // 'left' or 'right' for positioning
        text: "Give me a message list example!",
        date: new Date(), // current date as example
        id: messages.length,
        userId: 0,
      };
      setMessages([...messages, newMessage]);
      setMessageText("");
    }
  };

  const handleMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessageText(event.target.value);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <>
      <Flex direction="column" h="100vh">
        <MainHeader />
        <Side />

        <Container
          maxW="container.xl"
          flex="1"
          overflowY="auto"
          mt={{ base: "8em", md: "6em" }}
          mb={4}
        >
          <VStack spacing="4" align="stretch" margin="auto">
            <VStack
              spacing="4"
              overflowY="scroll"
              height="100vh"
              padding="3"
              borderWidth="1px"
            >
              {messages.map((msg, index) => (
                <HStack
                  key={index}
                  alignSelf={
                    msg.position === "right" ? "flex-end" : "flex-start"
                  }
                >
                  {msg.position === "left" && <Avatar src={msg.avatar} />}
                  <Text
                    fontSize="md"
                    padding="2"
                    borderRadius="lg"
                    bg="blue.100"
                  >
                    {msg.text}
                  </Text>
                  {msg.position === "right" && <Avatar src={msg.avatar} />}
                </HStack>
              ))}
            </VStack>
          </VStack>
        </Container>
        <Container maxW="container.xl" my={4}>
          <HStack>
            <Input
              placeholder="Type your message..."
              value={messageText}
              onChange={handleMessageChange}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={handleSendMessage}>Send</Button>
          </HStack>
        </Container>
      </Flex>
    </>
  );
};

export default ChatLayout;
