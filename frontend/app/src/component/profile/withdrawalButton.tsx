import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Box,
  List,
  ListItem,
  ListIcon,
  useDisclosure,
  HStack,
} from "@chakra-ui/react";
import { MdWarning, MdCancel, MdCheckCircle } from "react-icons/md";
import { FaExclamationTriangle } from "react-icons/fa";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  subscriptionType?: "monthly" | "yearly";
  nextBillingDate?: string;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  subscriptionType = "monthly",
  nextBillingDate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"confirm" | "final">("confirm");

  const handleFirstConfirm = () => {
    setStep("final");
  };

  const handleFinalConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("退会処理エラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep("confirm");
    onClose();
  };

  const subscriptionInfo =
    subscriptionType === "monthly" ? "月額500円プラン" : "年額5,500円プラン";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        {step === "confirm" ? (
          <>
            <ModalHeader>
              <HStack>
                <FaExclamationTriangle color="orange" />
                <Text>退会手続きの確認</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>本当に退会しますか？</AlertTitle>
                    <AlertDescription fontSize="sm" mt={2}>
                      退会すると以下の内容がすべて削除されます
                    </AlertDescription>
                  </Box>
                </Alert>

                <Box bg="gray.50" p={4} borderRadius="md">
                  <Text fontWeight="bold" mb={3}>
                    削除される内容
                  </Text>
                  <List spacing={2}>
                    <ListItem fontSize="sm">
                      <ListIcon as={MdCancel} color="red.500" />
                      出品中のアイテム情報
                    </ListItem>
                    <ListItem fontSize="sm">
                      <ListIcon as={MdCancel} color="red.500" />
                      交換履歴
                    </ListItem>
                    <ListItem fontSize="sm">
                      <ListIcon as={MdCancel} color="red.500" />
                      お気に入り・保存したアイテム
                    </ListItem>
                  </List>
                </Box>

                <Divider />

                <Box bg="blue.50" p={4} borderRadius="md">
                  <Text fontWeight="bold" mb={2}>
                    サブスクリプション情報
                  </Text>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm">
                      現在のプラン: <strong>{subscriptionInfo}</strong>
                    </Text>
                    {nextBillingDate && (
                      <Text fontSize="sm">次回請求日: {nextBillingDate}</Text>
                    )}
                    <Text fontSize="sm" color="red.600" fontWeight="medium">
                      ※ 退会と同時にサブスクリプションも解約されます
                    </Text>
                  </VStack>
                </Box>

                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    退会後も同じメールアドレスで再登録が可能ですが、
                    削除されたデータは復元できません。
                  </Text>
                </Alert>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleClose}>
                キャンセル
              </Button>
              <Button colorScheme="red" onClick={handleFirstConfirm}>
                退会手続きを進める
              </Button>
            </ModalFooter>
          </>
        ) : (
          <>
            <ModalHeader>
              <HStack>
                <MdWarning color="red" />
                <Text color="red.600">最終確認</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>この操作は取り消せません</AlertTitle>
                    <AlertDescription fontSize="sm" mt={2}>
                      本当に退会してもよろしいですか？
                    </AlertDescription>
                  </Box>
                </Alert>

                <Box textAlign="center" py={4}>
                  <Text fontSize="lg" fontWeight="bold" color="red.600">
                    すべてのデータが完全に削除されます
                  </Text>
                  <Text fontSize="sm" color="gray.600" mt={2}>
                    この操作を実行すると、アカウントとすべての関連データが
                    即座に削除され、復元することはできません。
                  </Text>
                </Box>

                <Box
                  bg="red.50"
                  p={4}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="red.200"
                >
                  <Text fontSize="sm" fontWeight="medium" color="red.700">
                    確認事項：
                  </Text>
                  <List spacing={1} mt={2}>
                    <ListItem fontSize="sm" color="red.700">
                      <ListIcon as={MdCheckCircle} color="red.500" />
                      データの削除について理解しました
                    </ListItem>
                    <ListItem fontSize="sm" color="red.700">
                      <ListIcon as={MdCheckCircle} color="red.500" />
                      サブスクリプションが解約されることを理解しました
                    </ListItem>
                    <ListItem fontSize="sm" color="red.700">
                      <ListIcon as={MdCheckCircle} color="red.500" />
                      この操作は取り消せないことを理解しました
                    </ListItem>
                  </List>
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="outline" mr={3} onClick={handleClose}>
                やめる
              </Button>
              <Button
                colorScheme="red"
                onClick={handleFinalConfirm}
                isLoading={isLoading}
                loadingText="退会処理中..."
              >
                退会する
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

// 退会ボタンコンポーネント
export const WithdrawalButton: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleWithdrawal = async () => {
    // ここで退会APIを呼び出す
    console.log("退会処理を実行");
    // await withdrawalApi();
  };

  return (
    <>
      <Button colorScheme="red" variant="outline" size="sm" onClick={onOpen}>
        退会する
      </Button>

      <WithdrawalModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleWithdrawal}
        subscriptionType="monthly" // ユーザーのプランに応じて変更
        nextBillingDate="2025年9月1日" // 実際の請求日を設定
      />
    </>
  );
};

export default WithdrawalButton;
