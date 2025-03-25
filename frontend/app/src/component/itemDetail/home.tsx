import { FC, useMemo } from "react";
import {
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  Stack,
  StackDivider,
  Box,
  VStack,
  Button,
} from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";
import useProfile from "../../hooks/useProfile";
import KeyboardControlGallerySlider from "../common/slider/keyboardControlGallerySlider";

const Home: FC = () => {
  const { getUserProfile } = useProfile();
  const [searchParams] = useSearchParams();
  const userItemNumver = searchParams.get("number"); // 'userItem' パラメータの値を取得

  const memorizeUserDate = useMemo(() => {
    return getUserProfile();
  }, [getUserProfile]);

  const memorizeItem = useMemo(() => {
    return memorizeUserDate.items[Number(userItemNumver)];
  }, [memorizeUserDate.items, userItemNumver]);

  if (userItemNumver === null) return;

  return (
    <>
      <Heading
        pl={{ md: 4, base: 0 }}
        mb={10}
        textAlign={{ base: "center", md: "justify" }}
      >
        {""}
      </Heading>

      <Stack
        direction={{ base: "column", md: "row" }}
        justifyContent={"space-around"}
        w={"full"}
      >
        <Box h={"500px"} w={{ base: "100%", md: "50%" }} p={4} my={2}>
          <KeyboardControlGallerySlider images={memorizeItem.image} />
        </Box>
        <Card w={"full"}>
          <CardHeader>
            <CardHeader>
              <Heading textTransform="uppercase" fontSize={"lg"}>
                {memorizeItem.title}
              </Heading>
            </CardHeader>
          </CardHeader>
          <CardBody>
            <Stack divider={<StackDivider />} spacing="4">
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  説明
                </Heading>
                <Text pt="2" fontSize="sm">
                  {memorizeItem.description}
                </Text>
              </Box>
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  タイプ
                </Heading>
                <Text pt="2" fontSize="sm">
                  {memorizeItem.type.name}
                </Text>
              </Box>
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  ブランド
                </Heading>
                <Text pt="2" fontSize="sm">
                  {memorizeItem.brand.name}
                </Text>
              </Box>
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  価格
                </Heading>
                <Text pt="2" fontSize="sm">
                  {memorizeItem.currency}
                  {memorizeItem.price}
                </Text>
              </Box>
            </Stack>
          </CardBody>
          <VStack align={"center"} my={4}>
            <Button size="lg">取引する</Button>
          </VStack>
        </Card>
      </Stack>
    </>
  );
};

export default Home;
