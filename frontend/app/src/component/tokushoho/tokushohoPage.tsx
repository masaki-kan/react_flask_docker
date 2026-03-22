import React, { FC } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Link,
  Badge,
  SimpleGrid,
  Icon,
  Card,
  CardBody,
  CardHeader,
  Stack,
  StackDivider,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import { useAppColors } from "../../utils/theme/colorModeUtils";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiUser,
  FiDollarSign,
  FiCreditCard,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiGift,
  FiPackage,
} from "react-icons/fi";
import { IconType } from "react-icons";

const TokushohoPage: React.FC = () => {
  const {
    pageBg,
    cardBg,
    borderColor,
    accentColor,
    textColor,
    headingColor,
    infoBg,
    infoBorder,
    successBg,
    successBorder,
  } = useAppColors();

  // ここに実際の事業者情報を設定してください
  const businessInfo = {
    serviceName: "僕らのヴィンテージ",
    operator: "山住 奎",
    responsiblePerson: "山住 奎",
    address: "請求があれば遅延なく開示します",
    phoneNumber: "請求があれば遅延なく開示します",
    email: "ourVintageApp@gmail.com",
    serviceType: "ヴィンテージアイテム交換プラットフォームサービス",
    pricing: {
      monthly: "月額プラン：990円（税込）",
      yearly: "年額プラン：9,900円（税込）",
    },
    paymentMethod: "クレジットカード（Stripe決済）※自動更新",
    paymentTiming: {
      monthly: "月額プラン：毎月の更新日に自動課金",
      yearly: "年額プラン：年度更新日に自動課金",
    },
    serviceStart: "決済完了後、即時利用可能",
    cancellationPolicy: {
      monthly: "いつでも解約可能。日割り計算による返金はありません。",
      yearly: "途中解約の場合、残期間分の返金はありません。",
      method: "マイページの「退会」から解約手続きが可能です。",
    },
    freeTrial: "新規登録時、初月の無料トライアル期間あり",
    notes: [
      "交換成立時の配送料は利用者間で取り決めください",
      "サービス内での金銭の授受は禁止しています",
      "不適切な利用が確認された場合、サービスの利用を停止することがあります",
    ],
  };

  type InfoItemtypeProps = {
    icon: IconType;
    label: string;
    value: string;
    isLink?: boolean;
  };

  const InfoItem: FC<InfoItemtypeProps> = ({
    icon,
    label,
    value,
    isLink = false,
  }) => (
    <HStack align="flex-start" spacing={4}>
      <Icon as={icon} boxSize={5} color={accentColor} mt={1} />
      <VStack align="start" spacing={1} flex={1}>
        <Text fontSize="sm" color={textColor} fontWeight="medium">
          {label}
        </Text>
        {isLink ? (
          <Link
            href={`mailto:${value}`}
            color={accentColor}
            fontSize="md"
            fontWeight="medium"
          >
            {value}
          </Link>
        ) : (
          <Text color={headingColor} fontSize="md" fontWeight="medium">
            {value}
          </Text>
        )}
      </VStack>
    </HStack>
  );

  return (
    <Box bg={pageBg} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* ヘッダー */}
          <Box textAlign="center" mb={4}>
            <Heading as="h1" size="lg" mb={3} color={headingColor}>
              特定商取引法に基づく表記
            </Heading>
            <Text color={textColor} fontSize="md">
              {businessInfo.serviceName} の運営に関する法定表記
            </Text>
          </Box>

          {/* メインコンテンツ */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* 事業者情報 */}
            <Card bg={cardBg} shadow="md" borderRadius="xl">
              <CardHeader pb={4}>
                <HStack>
                  <Icon as={FiUser} boxSize={6} color={accentColor} />
                  <Heading size="md" color={headingColor}>
                    事業者情報
                  </Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <Stack
                  spacing={6}
                  divider={<StackDivider borderColor={borderColor} />}
                >
                  <InfoItem
                    icon={FiPackage}
                    label="サービス名"
                    value={businessInfo.serviceName}
                  />
                  <InfoItem
                    icon={FiUser}
                    label="運営者"
                    value={businessInfo.operator}
                  />
                  <InfoItem
                    icon={FiUser}
                    label="運営責任者"
                    value={businessInfo.responsiblePerson}
                  />
                  <InfoItem
                    icon={FiMapPin}
                    label="所在地"
                    value={businessInfo.address}
                  />
                </Stack>
              </CardBody>
            </Card>

            {/* 連絡先情報 */}
            <Card bg={cardBg} shadow="md" borderRadius="xl">
              <CardHeader pb={4}>
                <HStack>
                  <Icon as={FiMail} boxSize={6} color={accentColor} />
                  <Heading size="md" color={headingColor}>
                    連絡先情報
                  </Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <Stack
                  spacing={6}
                  divider={<StackDivider borderColor={borderColor} />}
                >
                  <InfoItem
                    icon={FiPhone}
                    label="電話番号"
                    value={businessInfo.phoneNumber}
                  />
                  <InfoItem
                    icon={FiMail}
                    label="メールアドレス"
                    value={businessInfo.email}
                    isLink
                  />
                  <Box>
                    <Text fontSize="sm" color={textColor}>
                      ※お問い合わせはメールにてお願いいたします
                    </Text>
                  </Box>
                  <Box>
                    <HStack>
                      <Icon as={FiPackage} boxSize={5} color={accentColor} />
                      <Text fontSize="sm" color={textColor} fontWeight="medium">
                        サービスURL
                      </Text>
                    </HStack>
                    <Link
                      href="https://bokurano-vintage.com"
                      color={accentColor}
                      fontSize="md"
                      fontWeight="medium"
                      mt={1}
                    >
                      https://bokurano-vintage.com
                    </Link>
                  </Box>
                </Stack>
              </CardBody>
            </Card>

            {/* 料金プラン */}
            <Card bg={cardBg} shadow="md" borderRadius="xl">
              <CardHeader pb={4}>
                <HStack>
                  <Icon as={FiDollarSign} boxSize={6} color={accentColor} />
                  <Heading size="md" color={headingColor}>
                    料金プラン
                  </Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <Stack spacing={4}>
                  <Box
                    p={4}
                    borderRadius="lg"
                    bg={infoBg}
                    borderWidth="1px"
                    borderColor={infoBorder}
                  >
                    <HStack justify="space-between" mb={2}>
                      <Badge colorScheme="blue" fontSize="sm">
                        月額プラン
                      </Badge>
                      <Text
                        fontWeight="bold"
                        fontSize="xl"
                        color={headingColor}
                      >
                        990円
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color={textColor}>
                      税込・自動更新
                    </Text>
                  </Box>

                  <Box
                    p={4}
                    borderRadius="lg"
                    bg={successBg}
                    borderWidth="1px"
                    borderColor={successBorder}
                  >
                    <HStack justify="space-between" mb={2}>
                      <Badge colorScheme="green" fontSize="sm">
                        年額プラン
                      </Badge>
                      <Text
                        fontWeight="bold"
                        fontSize="xl"
                        color={headingColor}
                      >
                        9,900円
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color={textColor}>
                      税込・自動更新
                    </Text>
                  </Box>

                  <Box mt={4}>
                    <HStack>
                      <Icon as={FiGift} color="orange.500" />
                      <Text fontWeight="medium" color={headingColor}>
                        無料トライアル
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color={textColor} mt={1}>
                      {businessInfo.freeTrial}
                    </Text>
                  </Box>
                </Stack>
              </CardBody>
            </Card>

            {/* 支払い情報 */}
            <Card bg={cardBg} shadow="md" borderRadius="xl">
              <CardHeader pb={4}>
                <HStack>
                  <Icon as={FiCreditCard} boxSize={6} color={accentColor} />
                  <Heading size="md" color={headingColor}>
                    支払い情報
                  </Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <Stack
                  spacing={6}
                  divider={<StackDivider borderColor={borderColor} />}
                >
                  <Box>
                    <Text fontWeight="medium" mb={2} color={headingColor}>
                      支払方法
                    </Text>
                    <Text color={textColor}>{businessInfo.paymentMethod}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="medium" mb={2} color={headingColor}>
                      支払時期
                    </Text>
                    <List spacing={2}>
                      <ListItem>
                        <ListIcon as={FiCheck} color="green.500" />
                        <Text as="span" color={textColor}>
                          {businessInfo.paymentTiming.monthly}
                        </Text>
                      </ListItem>
                      <ListItem>
                        <ListIcon as={FiCheck} color="green.500" />
                        <Text as="span" color={textColor}>
                          {businessInfo.paymentTiming.yearly}
                        </Text>
                      </ListItem>
                    </List>
                    <Text fontSize="sm" color={textColor} mt={2}>
                      ※無料トライアル終了後から課金開始
                    </Text>
                  </Box>

                  <Box>
                    <Text fontWeight="medium" mb={2} color={headingColor}>
                      サービス開始時期
                    </Text>
                    <Text color={textColor}>{businessInfo.serviceStart}</Text>
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* 解約・返金ポリシー */}
          <Card bg={cardBg} shadow="md" borderRadius="xl">
            <CardHeader pb={4}>
              <HStack>
                <Icon as={FiX} boxSize={6} color="red.500" />
                <Heading size="md" color={headingColor}>
                  解約・返金ポリシー
                </Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Box>
                  <Text fontWeight="bold" mb={3} color={headingColor}>
                    解約方法
                  </Text>
                  <Text color={textColor}>
                    {businessInfo.cancellationPolicy.method}
                  </Text>
                  <Text fontSize="sm" color={textColor} mt={2}>
                    ※解約後も契約期間終了まではサービスをご利用いただけます
                  </Text>
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={3} color={headingColor}>
                    返金ポリシー
                  </Text>
                  <List spacing={2}>
                    <ListItem>
                      <Text color={textColor}>
                        <Text as="span" fontWeight="medium">
                          月額プラン：
                        </Text>
                        {businessInfo.cancellationPolicy.monthly}
                      </Text>
                    </ListItem>
                    <ListItem>
                      <Text color={textColor}>
                        <Text as="span" fontWeight="medium">
                          年額プラン：
                        </Text>
                        {businessInfo.cancellationPolicy.yearly}
                      </Text>
                    </ListItem>
                  </List>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* 注意事項 */}
          <Card bg={cardBg} shadow="md" borderRadius="xl">
            <CardHeader pb={4}>
              <HStack>
                <Icon as={FiAlertCircle} boxSize={6} color="orange.500" />
                <Heading size="md" color={headingColor}>
                  ご利用にあたっての注意事項
                </Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <List spacing={3}>
                {businessInfo.notes.map((note, index) => (
                  <ListItem key={index} display="flex" alignItems="flex-start">
                    <ListIcon as={FiAlertCircle} color="orange.500" mt={1} />
                    <Text color={textColor}>{note}</Text>
                  </ListItem>
                ))}
                <ListItem display="flex" alignItems="flex-start">
                  <ListIcon as={FiAlertCircle} color="orange.500" mt={1} />
                  <Text color={textColor}>
                    サブスクリプションは自動更新されます。解約をご希望の場合は、更新日の前日までにお手続きください。
                  </Text>
                </ListItem>
              </List>
            </CardBody>
          </Card>

          {/* その他の費用 */}
          <Box
            bg={infoBg}
            p={6}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={infoBorder}
          >
            <HStack mb={3}>
              <Icon as={FiDollarSign} boxSize={5} color="blue.500" />
              <Text fontWeight="bold" color={headingColor}>
                その他の費用について
              </Text>
            </HStack>
            <Text color={textColor}>
              サービス利用料以外の費用は発生しません。
              ※交換時の配送料は利用者間での取り決めとなります
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default TokushohoPage;
