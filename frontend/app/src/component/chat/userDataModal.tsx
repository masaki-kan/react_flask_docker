import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  HStack,
  Avatar,
  Icon,
  Divider,
  Box,
  Badge,
  Text,
} from "@chakra-ui/react";
import { FC } from "react";
import { FaUserCircle } from "react-icons/fa";
import { userDataType } from "../../types/chatType";

type UserDataModalType = {
  isUserOpen: boolean;
  onUserClose: () => void;
  selectedUser: "seller" | "buyer" | null;
  memorizeSellerUserData: userDataType;
  memorizeBuyerUserData: userDataType;
};

const UserDataModal: FC<UserDataModalType> = ({
  isUserOpen,
  onUserClose,
  selectedUser,
  memorizeSellerUserData,
  memorizeBuyerUserData,
}) => {
  return (
    <>
      <Modal isOpen={isUserOpen} onClose={onUserClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedUser === "seller" ? "交換受理者" : "交換申請者"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="start">
              <HStack spacing={4}>
                {/* プロフィール画像の表示 */}
                {selectedUser === "seller" ? (
                  // 売り手（交換を受ける人）の場合
                  memorizeSellerUserData.profile_image?.length > 0 ? (
                    <Avatar
                      size="xl"
                      src={memorizeSellerUserData.profile_image}
                      name={memorizeSellerUserData.name}
                    />
                  ) : (
                    <Icon as={FaUserCircle} boxSize={16} color="gray.400" />
                  )
                ) : // 買い手（交換したい人）の場合
                memorizeBuyerUserData.profile_image?.length > 0 ? (
                  <Avatar
                    size="xl"
                    src={memorizeBuyerUserData.profile_image}
                    name={memorizeBuyerUserData.name}
                  />
                ) : (
                  <Icon as={FaUserCircle} boxSize={16} color="gray.400" />
                )}

                <VStack align="start">
                  <Text fontSize="lg" fontWeight="bold">
                    {selectedUser === "seller"
                      ? memorizeSellerUserData.name || "名前未設定"
                      : memorizeBuyerUserData.name || "名前未設定"}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {selectedUser === "seller"
                      ? memorizeSellerUserData.location || "場所未設定"
                      : memorizeBuyerUserData.location || "場所未設定"}
                  </Text>
                </VStack>
              </HStack>
              <Divider />

              {/* お気に入りショップ */}
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  お気に入りショップ
                </Text>
                <Text fontSize="sm" color="gray.600" wordBreak={"break-all"}>
                  {selectedUser === "seller"
                    ? memorizeSellerUserData.shop_name !== null
                      ? memorizeSellerUserData.shop_name
                      : "未設定"
                    : memorizeBuyerUserData.shop_name !== null
                      ? memorizeBuyerUserData.shop_name
                      : "未設定"}
                </Text>

                <Text
                  fontSize="sm"
                  color="blue.500"
                  as="a"
                  href={
                    selectedUser === "seller"
                      ? memorizeSellerUserData.shop_url
                      : memorizeBuyerUserData.shop_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  wordBreak={"break-all"}
                >
                  {selectedUser === "seller"
                    ? memorizeSellerUserData.shop_url
                    : memorizeBuyerUserData.shop_url}
                </Text>
              </Box>

              {/* タグ情報 */}
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  好きなジャンル
                </Text>
                <HStack wrap="wrap" spacing={2}>
                  {selectedUser === "seller" ? (
                    memorizeSellerUserData.tags.length > 0 ? (
                      memorizeSellerUserData.tags.map((tag, index) => {
                        return (
                          <Badge colorScheme="blue" size="sm" key={index}>
                            {tag.name}
                          </Badge>
                        );
                      })
                    ) : (
                      <Text fontSize="sm" color="gray.600">
                        未設定
                      </Text>
                    )
                  ) : memorizeBuyerUserData.tags.length > 0 ? (
                    memorizeBuyerUserData.tags.map((tag, index) => {
                      return (
                        <Badge colorScheme="blue" size="sm" key={index}>
                          {tag.name}
                        </Badge>
                      );
                    })
                  ) : (
                    <Text fontSize="sm" color="gray.600">
                      未設定
                    </Text>
                  )}
                </HStack>
              </Box>

              {/* 年齢情報 */}
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  古着歴
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {selectedUser === "seller"
                    ? `${memorizeSellerUserData.age !== 0 ? memorizeSellerUserData.age + "年" : "未設定"}`
                    : `${memorizeBuyerUserData.age !== 0 ? memorizeBuyerUserData.age + "年" : "未設定"}`}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  古着にハマったキッカケ
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {selectedUser === "seller"
                    ? `${memorizeSellerUserData.reasen || "未設定"}`
                    : `${memorizeBuyerUserData.reasen || "未設定"}`}
                </Text>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UserDataModal;
