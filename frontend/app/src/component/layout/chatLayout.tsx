import { ChangeEvent, FC, useCallback, useState } from "react";
import MainHeader from "../common/layout/mainHeader";
import Side from "../common/layout/side";
import "react-chat-elements/dist/main.css";
import {
  MessageList,
  Input,
  //   type MessageType,
} from "react-chat-elements";

import { Card, Container, Flex, HStack } from "@chakra-ui/react";

const ChatLayout: FC = () => {
  const [messageText, setMessageText] = useState<string>("");
  const messages = [
    {
      avatar: "https://avatars.githubusercontent.com/u/80540635?v=4",
      position: "left", // 'left' or 'right' for positioning
      type: "text" as const, // 'text' type for text messages
      title: "Kursat",
      text: "Give me a message list example!",
      date: new Date(), // current date as example
      dateString: new Date().toUTCString(), // String representation of the date
      id: "1", // unique id for the message
      titleColor: "blue", // color for the title
    },
    {
      avatar:
        "https://cdn.usegalileo.ai/sdxl10/014920d7-e0b4-4ffa-823a-811dd0d3cdbc.png",
      position: "right",
      type: "text" as const,
      title: "Emre",
      text: "That's all.",
      date: new Date(),
      dateString: new Date().toUTCString(),
      id: "2",
      titleColor: "green",
    },
  ];

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      // エンターキーが押された場合
      event.preventDefault(); // フォームの自動送信を防止
      alert("Sending..."); // 実際にはここでメッセージ送信処理を呼び出す
      console.log(messageText);
      return;
    }
  };

  const handleMessage = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
  }, []);

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
        >
          {/* <Outlet /> */}
          <Card w={"full"} height={`100vh`} overflow="hidden">
            <MessageList
              className="message-list"
              lockable={true}
              toBottomHeight={"100%"}
              dataSource={messages}
              style={{ overflowY: "auto", height: "100%" }}
            />
          </Card>
        </Container>
        <Container maxW="container.xl" my={2}>
          <HStack
            w={"full"}
            flex="1"
            borderWidth={"1px"}
            mt={4}
            borderRadius={"4px"}
            justifyContent={"space-between"}
            alignItems={"center"}
            p={2}
          >
            <Input
              placeholder="Type here..."
              maxHeight={200}
              value={messageText}
              onChange={handleMessage}
              onKeyPress={handleKeyPress} // イベントハンドラを設定
            />
          </HStack>
        </Container>
      </Flex>
    </>
  );
};

export default ChatLayout;
