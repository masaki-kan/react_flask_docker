import { FC, useCallback, useMemo } from "react";
import {
  VStack,
  Text,
  Avatar,
  Tag,
  Wrap,
  Link,
  Button,
  HStack,
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Icon,
  Divider,
  useColorModeValue,
  IconButton,
} from "@chakra-ui/react";
import MyItems from "./myItems";
import useMyProfile from "../../hooks/useProfile";
import LogOut from "../common/layout/logOut";
import { plans } from "../../consts/profileConsts";
import Withdrawal from "../common/layout/withdrawal";
import {
  FaUserCircle,
  FaEdit,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaHeart,
  FaStore,
  FaLink,
  FaComment,
  FaCrown,
} from "react-icons/fa";
import { IconType } from "react-icons";

type profileIndexType = {
  editFormSwitch: () => void;
};

const ProfileIndex: FC<profileIndexType> = ({ editFormSwitch }) => {
  const { memorizeProfile } = useMyProfile();
  const profile = useMemo(() => memorizeProfile, [memorizeProfile]);

  // カラーモード対応
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const sectionBg = useColorModeValue("gray.50", "gray.900");
  const textMuted = useColorModeValue("gray.600", "gray.400");
  const accentColor = useColorModeValue("blue.500", "blue.400");

  const InfoItem: FC<{
    icon: IconType;
    label: string;
    value: React.ReactNode;
    isEmpty?: boolean;
  }> = ({ icon, label, value, isEmpty }) => (
    <VStack align="start" spacing={1} w="full">
      <HStack spacing={2} color={textMuted}>
        <Icon as={icon} boxSize={4} />
        <Text fontSize="sm" fontWeight="medium">
          {label}
        </Text>
      </HStack>
      <Box pl={6}>
        {isEmpty ? (
          <Text fontSize="sm" color={textMuted} fontStyle="italic">
            未設定
          </Text>
        ) : (
          <Box fontSize="md" fontWeight="medium">
            {value}
          </Box>
        )}
      </Box>
    </VStack>
  );

  const tagsViewRender = useCallback(() => {
    if (profile.profile.tag.length > 0) {
      return (
        <Wrap spacing={2}>
          {profile.profile.tag.map((tag, index) => (
            <Tag
              key={index}
              size="md"
              colorScheme="teal"
              borderRadius="full"
              px={3}
              py={1}
            >
              {tag.name}
            </Tag>
          ))}
        </Wrap>
      );
    }
    return null;
  }, [profile]);

  const favoriteShopViewRender = useCallback(() => {
    if (profile.profile.favoriteShop.name) {
      return (
        <VStack align="start" spacing={2}>
          <Text fontWeight="medium">{profile.profile.favoriteShop.name}</Text>
          {profile.profile.favoriteShop.url && (
            <Link
              href={profile.profile.favoriteShop.url}
              isExternal
              color={accentColor}
              fontSize="sm"
              _hover={{ textDecoration: "underline" }}
            >
              <HStack spacing={1}>
                <Icon as={FaLink} boxSize={3} />
                <Text>ショップを見る</Text>
              </HStack>
            </Link>
          )}
        </VStack>
      );
    }
    return null;
  }, [profile.profile.favoriteShop, accentColor]);

  const planView = () => {
    const plan = plans
      .filter((p) => p.planKey === profile.profile.plan)
      .map((p) => p.planContents);
    return plan[0];
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Grid templateColumns={{ base: "1fr", lg: "350px 1fr" }} gap={8}>
        {/* 左サイドバー - プロフィール情報 */}
        <GridItem>
          <Box
            bg={bgColor}
            borderRadius="xl"
            p={4}
            boxShadow="lg"
            border="1px solid"
            borderColor={borderColor}
            position="sticky"
            top={4}
          >
            {/* アバターとメイン情報 */}
            <VStack spacing={4}>
              <Box position="relative">
                {profile.profile.image.length > 0 ? (
                  <Avatar
                    size="xl"
                    src={profile.profile.image}
                    name={profile.profile.name}
                    border="4px solid"
                    borderColor={borderColor}
                  />
                ) : (
                  <Box
                    p={8}
                    bg={sectionBg}
                    borderRadius="full"
                    border="4px solid"
                    borderColor={borderColor}
                  >
                    <Icon as={FaUserCircle} boxSize={16} color="gray.400" />
                  </Box>
                )}
                <IconButton
                  aria-label="Edit profile"
                  icon={<FaEdit />}
                  size="sm"
                  colorScheme="blue"
                  position="absolute"
                  bottom={0}
                  right={0}
                  borderRadius="full"
                  onClick={editFormSwitch}
                  boxShadow="md"
                />
              </Box>

              <HStack spacing={1}>
                <Heading size="sm">{profile.profile.name}</Heading>
                <HStack>
                  <Icon as={FaMapMarkerAlt} color={textMuted} boxSize={4} />
                  <Text color={textMuted} fontSize={"sm"}>
                    {profile.profile.location || "未設定"}
                  </Text>
                </HStack>
              </HStack>

              <Divider />
              {/* プラン情報 */}
              <Box w="full">
                <HStack
                  bg={sectionBg}
                  px={4}
                  py={2}
                  borderRadius="lg"
                  justify="space-between"
                >
                  <HStack>
                    <Icon as={FaCrown} color="yellow.500" boxSize={5} />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="bold">
                        {planView().title}
                      </Text>
                      <Text fontSize="xs" color={textMuted}>
                        {planView().text}
                      </Text>
                    </VStack>
                  </HStack>
                </HStack>
              </Box>

              <Button
                w="full"
                colorScheme="blue"
                size="md"
                onClick={editFormSwitch}
                leftIcon={<FaEdit />}
              >
                プロフィールを編集
              </Button>
            </VStack>
          </Box>
        </GridItem>

        {/* 右側 - 詳細情報 */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            {/* 基本情報セクション */}
            <Box
              bg={bgColor}
              borderRadius="xl"
              p={6}
              boxShadow="sm"
              border="1px solid"
              borderColor={borderColor}
            >
              <Heading size="md" mb={4}>
                基本情報
              </Heading>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                <InfoItem
                  icon={FaCalendarAlt}
                  label="年代"
                  value={
                    profile.profile.old ? `${profile.profile.old}代` : null
                  }
                  isEmpty={!profile.profile.old}
                />
                <InfoItem
                  icon={FaHeart}
                  label="古着歴"
                  value={
                    profile.profile.age ? `${profile.profile.age}年目` : null
                  }
                  isEmpty={!profile.profile.age}
                />
              </Grid>
            </Box>

            {/* 好きなジャンル */}
            {profile.profile.tag.length > 0 && (
              <Box
                bg={bgColor}
                borderRadius="xl"
                p={6}
                boxShadow="sm"
                border="1px solid"
                borderColor={borderColor}
              >
                <Heading size="md" mb={4}>
                  好きなジャンル
                </Heading>
                {tagsViewRender()}
              </Box>
            )}

            {/* お気に入りの店 */}
            {profile.profile.favoriteShop.name && (
              <Box
                bg={bgColor}
                borderRadius="xl"
                p={6}
                boxShadow="sm"
                border="1px solid"
                borderColor={borderColor}
              >
                <InfoItem
                  icon={FaStore}
                  label="お気に入りの店"
                  value={favoriteShopViewRender()}
                />
              </Box>
            )}

            {/* 古着にハマったきっかけ */}
            {profile.profile.reasen && (
              <Box
                bg={bgColor}
                borderRadius="xl"
                p={6}
                boxShadow="sm"
                border="1px solid"
                borderColor={borderColor}
              >
                <InfoItem
                  icon={FaComment}
                  label="古着にハマったきっかけ"
                  value={
                    <Text lineHeight="tall" color={textMuted}>
                      {profile.profile.reasen}
                    </Text>
                  }
                />
              </Box>
            )}

            {/* マイアイテム */}
            <MyItems />

            {/* アカウント設定 */}
            <Box
              bg={bgColor}
              borderRadius="xl"
              p={6}
              boxShadow="sm"
              border="1px solid"
              borderColor={borderColor}
            >
              <Heading size="md" mb={4}>
                アカウント設定
              </Heading>
              <HStack justify="space-between">
                <LogOut />
                <Withdrawal />
              </HStack>
            </Box>
          </VStack>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default ProfileIndex;
