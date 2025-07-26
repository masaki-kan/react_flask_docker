import { FC } from "react";
import {
  Box,
  VStack,
  Text,
  Image,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import CustomImageSlider from "../common/slider/customImageSlider";
import { brandType } from "../../types/archiveTradeType";
import { itemTypeViewHanlder } from "../common/type/itemTypeView";

interface ArchiveItemDetailProps {
  title?: string;
  itemTitle?: string;
  itemDescription?: string;
  itemImages?: string[];
  itemType?: string;
  itemBrand?: brandType;
}

const ArchiveItemDetail: FC<ArchiveItemDetailProps> = ({
  title,
  itemTitle,
  itemDescription,
  itemImages,
  itemType,
  itemBrand,
}) => {
  console.log(itemType, itemBrand);
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box
        flex={1}
        p={3}
        w={"50%"}
        borderRadius="md"
        borderWidth={1}
        borderColor="gray.200"
        cursor="pointer"
        onClick={onOpen}
        _hover={{
          shadow: "md",
          borderColor: "blue.300",
        }}
      >
        <Text fontSize="xs" fontWeight="bold" mb={2} color="gray.600">
          {title}
        </Text>
        {itemImages && itemImages.length > 0 && (
          <Image
            src={itemImages[0]}
            alt={itemTitle}
            h="100px"
            w="100%"
            objectFit="cover"
            borderRadius="sm"
            mb={2}
          />
        )}
        <VStack align="start" spacing={1}>
          <Text
            fontSize="sm"
            fontWeight="medium"
            noOfLines={1}
            whiteSpace={"wrap"}
          >
            {itemTitle}
          </Text>
          {itemType && (
            <Badge
              colorScheme="blue"
              size="sm"
              noOfLines={1}
              whiteSpace={"wrap"}
            >
              {itemTypeViewHanlder(itemType)}
            </Badge>
          )}
          {itemBrand && (
            <Badge
              colorScheme="purple"
              size="sm"
              noOfLines={1}
              whiteSpace={"wrap"}
            >
              {Array.isArray(itemBrand) ? itemBrand[0]?.name : itemBrand.name}
            </Badge>
          )}
        </VStack>
      </Box>

      {/* 詳細モーダル */}
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
                  {itemBrand?.name}
                </Text>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ArchiveItemDetail;
