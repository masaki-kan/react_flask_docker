// myItems.tsx
import { FC, useCallback, useMemo } from "react";
import {
  Center,
  VStack,
  Text,
  Box,
  useColorModeValue,
  SimpleGrid,
  Skeleton,
} from "@chakra-ui/react";
import useMyProfile from "../../hooks/useProfile";
import RebderItem from "../render/renderItem";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";
import { useSelector } from "react-redux";
import { RootState } from "src/store";

const MyItems: FC = () => {
  const textMuted = useColorModeValue("gray.600", "gray.400");
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const navigate = useNavigate();
  const { memorizeProfile } = useMyProfile();
  const loading = useSelector((state: RootState) => state.profile.loading);

  const itemDetailHanlder = useCallback(
    (index: string) => {
      navigate(`${route.myItemEdit}?userItem=${index}`);
    },
    [navigate]
  );

  const isInitialLoad = useMemo(() => {
    return loading.items && memorizeProfile.items.length === 0;
  }, [loading.items, memorizeProfile.items.length]);

  // 初回ローディング中
  if (isInitialLoad) {
    return (
      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} w="full">
        {[...Array(6)].map((_, index) => (
          <Box key={index}>
            <Skeleton height="250px" borderRadius="lg" />
            <Skeleton height="20px" mt={2} />
            <Skeleton height="16px" mt={1} width="80%" />
          </Box>
        ))}
      </SimpleGrid>
    );
  }

  // 商品が0件の場合
  if (!loading.items && memorizeProfile.items.length === 0) {
    return (
      <Center py={8}>
        <VStack spacing={4}>
          <Box p={8} bg={bgColor} borderRadius="lg">
            <Text color={textMuted} fontSize="md" fontWeight="medium">
              登録されている商品はありません
            </Text>
          </Box>
        </VStack>
      </Center>
    );
  }

  // 商品がある場合
  return (
    <VStack align={"start"} w={"full"}>
      <RebderItem
        itemList={memorizeProfile.items}
        navigate={itemDetailHanlder}
      />
    </VStack>
  );
};

export default MyItems;
