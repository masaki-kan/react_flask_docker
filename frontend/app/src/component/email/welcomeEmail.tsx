import {
  Html,
  Text,
  Head,
  Body,
  Container,
  Preview,
} from "@react-email/components";
import { FC } from "react";

type WelcomeEmailType = {
  userName: string;
  planType: string;
};

const WelcomeEmail: FC<WelcomeEmailType> = () => (
  <Html>
    <Head />
    <Preview>ようこそ、僕らのヴィンテージへ</Preview>
    <Body style={{ fontFamily: "sans-serif" }}>
      <Container>
        <Text style={{ fontSize: "16px" }}>こんにちは！</Text>
        <Text>会員登録が完了しました。ご利用ありがとうございます。</Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;
