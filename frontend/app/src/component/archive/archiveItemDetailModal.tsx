import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box,
  VStack,
  Text,
} from "@chakra-ui/react";
import { FC } from "react";
import CustomImageSlider from "../common/slider/customImageSlider";
import { itemTypeViewHanlder } from "../common/type/itemTypeView";
import { brandType } from "../../types/archiveTradeType";

type ArchiveItemDetailModalPropsType = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  itemTitle?: string;
  itemDescription?: string;
  itemImages?: string[];
  itemType?: string;
  itemBrand?: brandType;
};
const ArchiveItemDetailModal: FC<ArchiveItemDetailModalPropsType> = ({
  isOpen,
  onClose,
  title,
  itemTitle,
  itemDescription,
  itemImages,
  itemType,
  itemBrand,
}) => {
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              {itemImages && itemImages.length > 0 && (
                <Box>
                  <CustomImageSlider images={itemImages} />
                </Box>
              )}
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  商品名
                </Text>
                <Text fontSize="sm">{itemTitle}</Text>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  説明
                </Text>
                <Text fontSize="sm" whiteSpace="pre-wrap">
                  {itemDescription}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  タイプ
                </Text>
                <Text fontSize="sm" whiteSpace="pre-wrap">
                  {itemType && itemTypeViewHanlder(itemType)}
                </Text>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  ブランド
                </Text>
                <Text fontSize="sm" whiteSpace="pre-wrap">
                  {itemBrand
                    ? itemBrand.name.length > 0
                      ? itemBrand.name
                      : itemBrand.name
                    : "未設定"}
                </Text>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ArchiveItemDetailModal;
