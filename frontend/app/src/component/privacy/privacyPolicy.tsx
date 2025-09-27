import { FC } from "react";
import { useAppColors } from "../../utils/theme/colorModeUtils";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  UnorderedList,
  ListItem,
  OrderedList,
  Divider,
  Badge,
  Card,
  CardBody,
} from "@chakra-ui/react";

const PrivacyPolicy: FC = () => {
  const {
    pageBg,
    cardBg,
    borderColor,
    textColor,
    headingColor,
  } = useAppColors();

  // プライバシーポリシーの構造化データ
  const privacyData = {
    serviceName: "僕らのヴィンテージ",
    updateDate: "2024年9月16日",
    sections: [
      {
        id: "intro",
        title: "はじめに",
        content: "当社は，当社が運営するサービス「僕らのヴィンテージ」がウェブサイト上で提供するサービス（以下,「本サービス」といいます。）における，お客様の個人情報の取扱いについて，以下のとおりプライバシーポリシー（以下，「本ポリシー」といいます。）を定めます。"
      },
      {
        id: "collection",
        title: "第1条　個人情報の収集方法",
        content: "当社は，お客様が利用登録をする際に氏名，メールアドレス，その他の個人情報をお尋ねすることがあります。また，お客様と提携先などとの間でなされたお客様の個人情報を含む取引記録や決済に関する情報を,当社の提携先（情報提供元，広告主，広告配信先などを含みます。以下，｢提携先｣といいます。）などから収集することがあります。"
      },
      {
        id: "purpose",
        title: "第2条　個人情報を収集・利用する目的",
        content: "当社が個人情報を収集・利用する目的は，以下のとおりです。",
        items: [
          "当社サービスの提供・運営のため",
          "お客様からのお問い合わせに回答するため（本人確認を行うことを含む）",
          "お客様が利用中のサービスの新機能，更新情報，キャンペーン等及び当社が提供する他のサービスの案内のメールを送付するため",
          "メンテナンス，重要なお知らせなど必要に応じたご連絡のため",
          "利用規約に違反したお客様や，不正・不当な目的でサービスを利用しようとするお客様の特定をし，ご利用をお断りするため",
          "お客様にご自身の登録情報の閲覧や変更，削除，ご利用状況の閲覧を行っていただくため",
          "有料サービスにおいて，お客様に利用料金を請求するため",
          "上記の利用目的に付随する目的"
        ]
      },
      {
        id: "purpose_change",
        title: "第3条　利用目的の変更",
        items: [
          "当社は，利用目的が変更前と関連性を有すると合理的に認められる場合に限り，個人情報の利用目的を変更するものとします。",
          "利用目的の変更を行った場合には，変更後の目的について，当社所定の方法により，お客様に通知し，または本ウェブサイト上に公表するものとします。"
        ]
      },
      {
        id: "third_party",
        title: "第4条　個人情報の第三者提供",
        items: [
          "当社は，次に掲げる場合を除いて，あらかじめお客様の同意を得ることなく，第三者に個人情報を提供することはありません。ただし，個人情報保護法その他の法令で認められる場合を除きます。",
        ],
        subItems: [
          "人の生命，身体または財産の保護のために必要がある場合であって，本人の同意を得ることが困難であるとき",
          "公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって，本人の同意を得ることが困難であるとき",
          "国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって，本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき",
          "予め次の事項を告知あるいは公表し，かつ当社が個人情報保護委員会に届出をしたとき"
        ],
        subSubItems: [
          "利用目的に第三者への提供を含むこと",
          "第三者に提供されるデータの項目",
          "第三者への提供の手段または方法",
          "本人の求めに応じて個人情報の第三者への提供を停止すること",
          "本人の求めを受け付ける方法"
        ],
        items2: [
          "前項の定めにかかわらず，次に掲げる場合には，当該情報の提供先は第三者に該当しないものとします。",
        ],
        subItems2: [
          "当社が利用目的の達成に必要な範囲内において個人情報の取扱いの全部または一部を委託する場合",
          "合併その他の事由による事業の承継に伴って個人情報が提供される場合",
          "個人情報を特定の者との間で共同して利用する場合であって，その旨並びに共同して利用される個人情報の項目，共同して利用する者の範囲，利用する者の利用目的および当該個人情報の管理について責任を有する者の氏名または名称について，あらかじめ本人に通知し，または本人が容易に知り得る状態に置いた場合"
        ]
      },
      {
        id: "disclosure",
        title: "第5条　個人情報の開示",
        items: [
          "当社は，本人から個人情報の開示を求められたときは，本人に対し，遅滞なくこれを開示します。ただし，開示することにより次のいずれかに該当する場合は，その全部または一部を開示しないこともあり，開示しない決定をした場合には，その旨を遅滞なく通知します。なお，個人情報の開示に際しては，1件あたり1，000円の手数料を申し受けます。",
        ],
        subItems: [
          "本人または第三者の生命，身体，財産その他の権利利益を害するおそれがある場合",
          "当社の業務の適正な実施に著しい支障を及ぼすおそれがある場合",
          "その他法令に違反することとなる場合"
        ],
        items2: [
          "前項の定めにかかわらず，履歴情報および特性情報などの個人情報以外の情報については，原則として開示いたしません。"
        ]
      },
      {
        id: "correction",
        title: "第6条　個人情報の訂正および削除",
        items: [
          "お客様は，当社の保有する自己の個人情報が誤った情報である場合には，当社が定める手続きにより，当社に対して個人情報の訂正，追加または削除（以下，「訂正等」といいます。）を請求することができます。",
          "当社は，お客様から前項の請求を受けてその請求に応じる必要があると判断した場合には，遅滞なく，当該個人情報の訂正等を行うものとします。",
          "当社は，前項の規定に基づき訂正等を行った場合，または訂正等を行わない旨の決定をしたときは遅滞なく，これをお客様に通知します。"
        ]
      },
      {
        id: "suspension",
        title: "第7条　個人情報の利用停止等",
        items: [
          "当社は，本人から，個人情報が，利用目的の範囲を超えて取り扱われているという理由，または不正の手段により取得されたものであるという理由により，その利用の停止または消去（以下，「利用停止等」といいます。）を求められた場合には，遅滞なく必要な調査を行います。",
          "前項の調査結果に基づき，その請求に応じる必要があると判断した場合には，遅滞なく，当該個人情報の利用停止等を行います。",
          "当社は，前項の規定に基づき利用停止等を行った場合，または利用停止等を行わない旨の決定をしたときは，遅滞なく，これを会員に通知します。",
          "前2項にかかわらず，利用停止等に多額の費用を有する場合その他利用停止等を行うことが困難な場合であって，会員の権利利益を保護するために必要なこれに代わるべき措置をとれる場合は，この代替策を講じるものとします。"
        ]
      },
      {
        id: "policy_change",
        title: "第8条　プライバシーポリシーの変更",
        items: [
          "本ポリシーの内容は，法令その他本ポリシーに別段の定めのある事項を除いて，お客様に通知することなく，変更することができるものとします。",
          "当社が別途定める場合を除いて，変更後のプライバシーポリシーは，本ウェブサイトに掲載したときから効力を生じるものとします。"
        ]
      },
      {
        id: "contact",
        title: "第9条　お問い合わせ窓口",
        content: "本ポリシーに関するお問い合わせは，下記の窓口までお願いいたします。",
        contactInfo: [
          "E-mail:yamasumi.bvintage@gmail.com"
        ]
      }
    ]
  };

  const SectionCard: FC<{ children: React.ReactNode; title: string }> = ({
    children,
    title,
  }) => (
    <Card
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <CardBody>
        <Heading size="md" color={headingColor} mb={4}>
          {title}
        </Heading>
        {children}
      </CardBody>
    </Card>
  );

  return (
    <Box bg={pageBg} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* ヘッダー */}
          <Box textAlign="center" mb={4}>
            <Heading as="h1" size="xl" mb={3} color={headingColor}>
              プライバシーポリシー
            </Heading>
            <Text color={textColor} fontSize="lg">
              {privacyData.serviceName} の個人情報保護方針
            </Text>
            <Badge colorScheme="blue" mt={2}>
              制定日：{privacyData.updateDate}
            </Badge>
          </Box>

          {/* はじめに */}
          <SectionCard title="プライバシーポリシー">
            <Text color={textColor} lineHeight="tall">
              {privacyData.sections[0].content}
            </Text>
          </SectionCard>

          {/* 第1条から第3条 */}
          {privacyData.sections.slice(1, 4).map((section) => (
            <SectionCard key={section.id} title={section.title}>
              <VStack align="stretch" spacing={4}>
                {section.content && (
                  <Text color={textColor} lineHeight="tall">
                    {section.content}
                  </Text>
                )}
                {section.items && (
                  <OrderedList color={textColor} spacing={3}>
                    {section.items.map((item, itemIndex) => (
                      <ListItem key={itemIndex} lineHeight="tall">
                        {item}
                      </ListItem>
                    ))}
                  </OrderedList>
                )}
              </VStack>
            </SectionCard>
          ))}

          {/* 第4条（個人情報の第三者提供） - 複雑な構造 */}
          <SectionCard title={privacyData.sections[4].title}>
            <VStack align="stretch" spacing={4}>
              <OrderedList color={textColor} spacing={3}>
                {privacyData.sections[4].items?.map((item, itemIndex) => (
                  <ListItem key={itemIndex} lineHeight="tall">
                    {item}
                    {itemIndex === 0 && (
                      <>
                        <OrderedList mt={2} ml={4}>
                          {privacyData.sections[4].subItems?.map((subItem, subIndex) => (
                            <ListItem key={subIndex} lineHeight="tall">
                              {subItem}
                              {subIndex === 3 && (
                                <UnorderedList mt={2} ml={4}>
                                  {privacyData.sections[4].subSubItems?.map((subSubItem, subSubIndex) => (
                                    <ListItem key={subSubIndex} lineHeight="tall">
                                      {subSubItem}
                                    </ListItem>
                                  ))}
                                </UnorderedList>
                              )}
                            </ListItem>
                          ))}
                        </OrderedList>
                      </>
                    )}
                  </ListItem>
                ))}
                {privacyData.sections[4].items2?.map((item, itemIndex) => (
                  <ListItem key={`items2-${itemIndex}`} lineHeight="tall" value={2}>
                    {item}
                    {itemIndex === 0 && (
                      <OrderedList mt={2} ml={4}>
                        {privacyData.sections[4].subItems2?.map((subItem, subIndex) => (
                          <ListItem key={subIndex} lineHeight="tall">
                            {subItem}
                          </ListItem>
                        ))}
                      </OrderedList>
                    )}
                  </ListItem>
                ))}
              </OrderedList>
            </VStack>
          </SectionCard>

          {/* 第5条（個人情報の開示） - 複雑な構造 */}
          <SectionCard title={privacyData.sections[5].title}>
            <VStack align="stretch" spacing={4}>
              <OrderedList color={textColor} spacing={3}>
                {privacyData.sections[5].items?.map((item, itemIndex) => (
                  <ListItem key={itemIndex} lineHeight="tall">
                    {item}
                    {itemIndex === 0 && (
                      <OrderedList mt={2} ml={4}>
                        {privacyData.sections[5].subItems?.map((subItem, subIndex) => (
                          <ListItem key={subIndex} lineHeight="tall">
                            {subItem}
                          </ListItem>
                        ))}
                      </OrderedList>
                    )}
                  </ListItem>
                ))}
                {privacyData.sections[5].items2?.map((item, itemIndex) => (
                  <ListItem key={`items2-${itemIndex}`} lineHeight="tall" value={2}>
                    {item}
                  </ListItem>
                ))}
              </OrderedList>
            </VStack>
          </SectionCard>

          {/* 第6条から第8条 */}
          {privacyData.sections.slice(6, 9).map((section) => (
            <SectionCard key={section.id} title={section.title}>
              <VStack align="stretch" spacing={4}>
                {section.content && (
                  <Text color={textColor} lineHeight="tall">
                    {section.content}
                  </Text>
                )}
                {section.items && (
                  <OrderedList color={textColor} spacing={3}>
                    {section.items.map((item, itemIndex) => (
                      <ListItem key={itemIndex} lineHeight="tall">
                        {item}
                      </ListItem>
                    ))}
                  </OrderedList>
                )}
              </VStack>
            </SectionCard>
          ))}

          {/* 第9条（お問い合わせ窓口） */}
          <SectionCard title={privacyData.sections[9].title}>
            <VStack align="stretch" spacing={4}>
              <Text color={textColor} lineHeight="tall">
                {privacyData.sections[9].content}
              </Text>
              <VStack align="start" spacing={2}>
                {privacyData.sections[9].contactInfo?.map((info, index) => (
                  <Text key={index} color={textColor} lineHeight="tall">
                    {info}
                  </Text>
                ))}
              </VStack>
            </VStack>
          </SectionCard>

          <Divider />

          {/* フッター */}
          <Box textAlign="center">
            <Text color="gray.500" fontSize="lg" fontWeight="bold" mb={4}>
              以上
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;