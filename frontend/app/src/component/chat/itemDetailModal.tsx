import { FC } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Stack,
  StackDivider,
} from "@chakra-ui/react";
import CustomImageSlider from "../slider/customImageSlider";
import { itemTypeViewHandler } from "../../utils/type/itemTypeView";
import { statusView } from "../save/saveStatusView.ts";
import { chatItemDataType } from "../../types/chatType";

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemData?: chatItemDataType; // 実際の型に置き換えてください
}

const ItemDetailModal: FC<ItemDetailModalProps> = ({
  isOpen,
  onClose,
  itemData,
}) => {
  if (!itemData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>交換申請の対象商品</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {/* ステータス表示 */}
            <HStack justifyContent="center">
              <Text fontSize="sm" fontWeight="bold" color="purple.600">
                {statusView(itemData.status)}
              </Text>
            </HStack>

            {/* 画像スライダー */}
            <Box>
              <CustomImageSlider images={itemData.images} />
            </Box>

            <Stack divider={<StackDivider />} spacing={4}>
              {/* 商品名 */}
              <Box>
                <Heading size="xs" textTransform="uppercase" mb={2}>
                  商品名
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  {itemData.title}
                </Text>
              </Box>

              {/* タイプ */}
              <Box>
                <Heading size="xs" textTransform="uppercase" mb={2}>
                  タイプ
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  {itemTypeViewHandler(itemData.type)}
                </Text>
              </Box>

              {/* 概要 */}
              <Box>
                <Heading size="xs" textTransform="uppercase" mb={2}>
                  商品説明
                </Heading>
                <Text fontSize="sm" color="gray.600" whiteSpace="pre-wrap">
                  {itemData.description}
                </Text>
              </Box>
            </Stack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ItemDetailModal;
