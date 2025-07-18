import { FC, useState, useCallback, useMemo, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  Avatar,
  Text,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  useToast,
  Tooltip,
  Badge,
  Divider,
  Icon,
} from "@chakra-ui/react";
import { FaBox, FaTruck, FaUserCircle, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";
import useLoading from "../../hooks/useLaoding";
import { useEffectOnce } from "react-use";
import FullScreenSpinner from "../common/spliner/FullScreenSpinner";
import useChat from "../../hooks/useChat";
import ChatRight from "./chatRight";
import ComponentHeader from "../common/layout/componentHeader";
import PartnerItemsModal from "./partnerItemsModal";
import ItemDetailModal from "./itemDetailModal";
import { statusView } from "../common/saved/saveStatusView.ts";
import { fetchConfirmationsApi } from "../../api/chatApi";
import ShippingInfoDisplay from "./shippingInfoDisplay";
import { shippingInfoType } from "../../types/chatType";

interface ShippingInfo {
  trackingNumber: string;
  shippingCompany: string;
}

const Home: FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    memorizeChatItemData,
    memorizePartnerItems,
    memorizeBuyerUserData,
    memorizeSellerUserData,
    memorizeShippingInfo,
    tradeStatusChangeHandler,
    saveShippingInfo,
    confirmItemReceived,
    getChatPageData,
  } = useChat();
  const { memorizeLoading } = useLoading();

  console.log("memorizeShippingInfo", memorizeShippingInfo);

  // URLパラメータの取得をメモ化
  const { tradeIdNumber, userIdNumber } = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return {
      tradeIdNumber: searchParams.get("item_id"),
      userIdNumber: searchParams.get("user_id"),
    };
  }, []);

  // モーダル管理
  const {
    isOpen: isItemOpen,
    onOpen: onItemOpen,
    onClose: onItemClose,
  } = useDisclosure();

  const {
    isOpen: isUserOpen,
    onOpen: onUserOpen,
    onClose: onUserClose,
  } = useDisclosure();

  const {
    isOpen: isPartnerItemsOpen,
    onOpen: onPartnerItemsOpen,
    onClose: onPartnerItemsClose,
  } = useDisclosure();

  const {
    isOpen: isShippingOpen,
    onOpen: onShippingOpen,
    onClose: onShippingClose,
  } = useDisclosure();

  // 状態管理
  const [selectedUser, setSelectedUser] = useState<"seller" | "buyer" | null>(
    null
  );
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    trackingNumber: "",
    shippingCompany: "",
  });

  // 発送状況
  const [hasUserShipped, setHasUserShipped] = useState<boolean>(false);
  const [hasPartnerShipped, setHasPartnerShipped] = useState<boolean>(false);
  const [sellerShippingData, setSellerShippingData] =
    useState<shippingInfoType>({
      user_id: 0,
      trade_id: 0,
      tracking_number: "",
      shipping_id: 0,
      shipping_company: "",
      sender_user_id: "",
      sender_name: "",
      created_at: "",
    });
  const [buyerShippingData, setBuyerShippingData] = useState<shippingInfoType>({
    user_id: 0,
    trade_id: 0,
    tracking_number: "",
    shipping_id: 0,
    shipping_company: "",
    sender_user_id: "",
    sender_name: "",
    created_at: "",
  });

  // 受取確認状況
  const [hasUserConfirmed, setHasUserConfirmed] = useState(false);
  const [hasPartnerConfirmed, setHasPartnerConfirmed] = useState(false);
  const [canCompleteTransaction, setCanCompleteTransaction] = useState(false);

  // 現在のユーザーがsellerかbuyerかを判定
  const isCurrentUserSeller = useMemo(() => {
    return memorizeChatItemData.user_id?.toString() === userIdNumber;
  }, [memorizeChatItemData.user_id, userIdNumber]);

  // 🔥 データ取得を一度だけ実行
  useEffectOnce(() => {
    if (tradeIdNumber) {
      getChatPageData(tradeIdNumber);
    }
  });

  // 発送情報と確認状況を監視
  useEffect(() => {
    if (memorizeShippingInfo) {
      // sellerとbuyerの発送情報をチェック
      const sellerShipping = memorizeShippingInfo.find(
        (info) =>
          info.sender_user_id?.toString() ===
          memorizeSellerUserData.user_id?.toString()
      );

      const buyerShipping = memorizeShippingInfo.find(
        (info) =>
          info.sender_user_id?.toString() ===
          memorizeBuyerUserData.user_id?.toString()
      );

      if (isCurrentUserSeller) {
        setHasUserShipped(!!sellerShipping);
        setHasPartnerShipped(!!buyerShipping);
      } else {
        setHasUserShipped(!!buyerShipping);
        setHasPartnerShipped(!!sellerShipping);
      }
      const buyerShippingData = memorizeShippingInfo.filter(
        (info) =>
          info.sender_user_id?.toString() ===
          memorizeBuyerUserData.user_id?.toString()
      );

      const sellerShippingData = memorizeShippingInfo.filter(
        (info) =>
          info.sender_user_id?.toString() ===
          memorizeSellerUserData.user_id?.toString()
      );
      setSellerShippingData(sellerShippingData[0]);
      setBuyerShippingData(buyerShippingData[0]);
    }
  }, [
    memorizeShippingInfo,
    memorizeChatItemData,
    isCurrentUserSeller,
    memorizeSellerUserData.user_id,
    memorizeBuyerUserData.user_id,
  ]);

  console.log(hasUserShipped);

  // 確認状況を定期的にチェック
  useEffect(() => {
    const checkConfirmations = async () => {
      if (tradeIdNumber && memorizeChatItemData.status === "shipped") {
        try {
          const result = await fetchConfirmationsApi(tradeIdNumber);
          if (result) {
            if (isCurrentUserSeller) {
              setHasUserConfirmed(result.seller_confirmed);
              setHasPartnerConfirmed(result.buyer_confirmed);
            } else {
              setHasUserConfirmed(result.buyer_confirmed);
              setHasPartnerConfirmed(result.seller_confirmed);
            }
            setCanCompleteTransaction(result.both_confirmed);
          }
        } catch (error) {
          console.error("確認状況の取得エラー:", error);
        }
      }
    };

    checkConfirmations();
    const interval = setInterval(checkConfirmations, 5000); // 5秒ごとにチェック

    return () => clearInterval(interval);
  }, [tradeIdNumber, memorizeChatItemData.status, isCurrentUserSeller]);

  // 相手の名前を取得する関数をメモ化
  const getPartnerName = useCallback(() => {
    if (!memorizeChatItemData.user_id || !memorizePartnerItems.length)
      return "相手";

    if (memorizeChatItemData.user_id.toString() === userIdNumber) {
      return memorizeBuyerUserData.name || "交換申請した人";
    } else {
      return memorizeSellerUserData.name || "申請受けた人";
    }
  }, [
    memorizeChatItemData.user_id,
    memorizePartnerItems.length,
    userIdNumber,
    memorizeBuyerUserData.name,
    memorizeSellerUserData.name,
  ]);

  // ユーザー情報モーダルを開く
  const handleUserClick = useCallback(
    (userType: "seller" | "buyer") => {
      setSelectedUser(userType);
      onUserOpen();
    },
    [onUserOpen]
  );

  // 発送処理をメモ化
  const handleShipping = useCallback(async () => {
    if (!shippingInfo.trackingNumber || !shippingInfo.shippingCompany) {
      toast({
        title: "入力エラー",
        description: "追跡番号と配送会社を入力してください",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // 発送情報を保存
      await saveShippingInfo(
        memorizeChatItemData.trade_id,
        userIdNumber!,
        shippingInfo.trackingNumber,
        shippingInfo.shippingCompany
      );

      onShippingClose();
      setShippingInfo({ trackingNumber: "", shippingCompany: "" });

      toast({
        title: "発送完了",
        description: "商品を発送済みに登録しました",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // データを再取得
      await getChatPageData(memorizeChatItemData.trade_id);
    } catch (error) {
      console.error("発送処理エラー:", error);
    }
  }, [
    shippingInfo,
    memorizeChatItemData.trade_id,
    userIdNumber,
    saveShippingInfo,
    onShippingClose,
    toast,
    getChatPageData,
  ]);

  // 受取確認処理
  const handleItemReceivedChange = useCallback(
    async (checked: boolean) => {
      if (checked && userIdNumber) {
        await confirmItemReceived(memorizeChatItemData.trade_id, userIdNumber);
        setHasUserConfirmed(true);

        toast({
          title: "受取確認完了",
          description: "商品の受取を確認しました",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [memorizeChatItemData.trade_id, userIdNumber, confirmItemReceived, toast]
  );

  // 取引完了処理をメモ化
  const handleCompleteTransaction = useCallback(async () => {
    if (!canCompleteTransaction) {
      toast({
        title: "確認エラー",
        description: "両者の商品到着確認が必要です",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const confirm = window.confirm("取引を完了してもよろしいですか？");
    if (confirm) {
      await tradeStatusChangeHandler(
        memorizeChatItemData.trade_id,
        "completed"
      );
      navigate(route.home);
    }
  }, [
    canCompleteTransaction,
    memorizeChatItemData.trade_id,
    tradeStatusChangeHandler,
    navigate,
    toast,
  ]);

  // 取引キャンセル処理をメモ化
  const handleCancelTransaction = useCallback(async () => {
    const confirm = window.confirm("取引をキャンセルしてもよろしいですか？");
    if (confirm) {
      await tradeStatusChangeHandler(
        memorizeChatItemData.trade_id,
        "cancelled"
      );
      navigate(route.home);
    }
  }, [memorizeChatItemData.trade_id, tradeStatusChangeHandler, navigate]);

  // 🔥 リダイレクト処理をHooks呼び出し後に移動
  if (tradeIdNumber === undefined || userIdNumber === undefined) {
    navigate(route.saved);
    return null;
  }

  return (
    <>
      <ComponentHeader title={"交換やりとり"} />
      {memorizeLoading && <FullScreenSpinner />}

      {/* ヘッダー部分：ユーザーアバターとステータス */}
      <Box
        bg="white"
        p={{ base: 3, md: 4 }}
        borderRadius="lg"
        boxShadow="sm"
        mb={4}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          gap={4}
        >
          {/* ユーザーアバター */}
          <HStack spacing={4} justify={{ base: "center", md: "flex-start" }}>
            <Tooltip label="交換したい人">
              {memorizeBuyerUserData.profile_image.length > 0 ? (
                <Avatar
                  size={"md"}
                  src={memorizeBuyerUserData.profile_image}
                  name={memorizeBuyerUserData.name}
                  onClick={() => handleUserClick("buyer")}
                  borderColor="blue.300"
                  cursor="pointer"
                />
              ) : (
                <Icon
                  as={FaUserCircle}
                  boxSize={10}
                  color="gray.400"
                  onClick={() => handleUserClick("buyer")}
                  cursor="pointer"
                />
              )}
            </Tooltip>
            <Tooltip label="交換したい人商品">
              <IconButton
                icon={<FaBox />}
                aria-label="交換したい人商品"
                onClick={onItemOpen}
                colorScheme="blue"
                variant="outline"
                size={{ base: "sm", md: "md" }}
              />
            </Tooltip>

            <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
              ⇄
            </Text>

            <Tooltip label="交換を受ける人">
              {memorizeSellerUserData.profile_image ? (
                <Avatar
                  size={"md"}
                  src={memorizeSellerUserData.profile_image}
                  name={memorizeSellerUserData.name}
                  onClick={() => handleUserClick("seller")}
                  borderColor="blue.300"
                  cursor="pointer"
                />
              ) : (
                <Icon
                  as={FaUserCircle}
                  boxSize={10}
                  color="gray.400"
                  onClick={() => handleUserClick("seller")}
                  cursor="pointer"
                />
              )}
            </Tooltip>
            <Tooltip label="交換を受ける人商品一覧">
              <IconButton
                icon={<FaBox />}
                aria-label="交換を受ける人商品一覧"
                onClick={onPartnerItemsOpen}
                colorScheme="blue"
                variant="outline"
                size={{ base: "sm", md: "md" }}
              />
            </Tooltip>
          </HStack>

          {/* ステータスとアクションボタン */}
          <VStack
            spacing={3}
            align={{ base: "stretch", md: "flex-end" }}
            w={{ base: "100%", md: "auto" }}
          >
            <HStack justify={{ base: "center", md: "flex-end" }} spacing={2}>
              <Badge
                colorScheme="purple"
                fontSize={{ base: "xs", md: "sm" }}
                p={2}
              >
                {statusView(memorizeChatItemData.status)}
              </Badge>
            </HStack>

            {/* 発送状況表示 */}
            {(memorizeChatItemData.status === "pending" ||
              memorizeChatItemData.status === "shipped") && (
              <VStack align="stretch" spacing={2}>
                <HStack>
                  <Icon
                    as={FaTruck}
                    color={hasUserShipped ? "green.500" : "gray.400"}
                  />
                  <Text fontSize="sm">
                    あなた: {hasUserShipped ? "発送済み" : "未発送"}
                  </Text>
                </HStack>
                <HStack>
                  <Icon
                    as={FaTruck}
                    color={hasPartnerShipped ? "green.500" : "gray.400"}
                  />
                  <Text fontSize="sm">
                    相手: {hasPartnerShipped ? "発送済み" : "未発送"}
                  </Text>
                </HStack>
              </VStack>
            )}

            {/* ステータスに応じたアクションボタン */}
            {memorizeChatItemData.status === "pending" && !hasUserShipped && (
              <Button
                leftIcon={<FaTruck />}
                colorScheme="green"
                size={{ base: "sm", md: "sm" }}
                onClick={onShippingOpen}
                w={{ base: "100%", md: "auto" }}
              >
                発送する
              </Button>
            )}

            {memorizeChatItemData.status === "shipped" && (
              <VStack align="stretch" spacing={2} w="100%">
                <Checkbox
                  isChecked={hasUserConfirmed}
                  onChange={(e) => handleItemReceivedChange(e.target.checked)}
                  size={{ base: "sm", md: "md" }}
                  isDisabled={hasUserConfirmed}
                >
                  <HStack>
                    <Text>相手の商品を受け取りました</Text>
                    {hasUserConfirmed && (
                      <Icon as={FaCheckCircle} color="green.500" boxSize={4} />
                    )}
                  </HStack>
                </Checkbox>

                <HStack>
                  <Icon
                    as={FaCheckCircle}
                    color={hasPartnerConfirmed ? "green.500" : "gray.400"}
                    boxSize={4}
                  />
                  <Text
                    fontSize="sm"
                    color={hasPartnerConfirmed ? "green.600" : "gray.600"}
                  >
                    相手の受取確認: {hasPartnerConfirmed ? "完了" : "未完了"}
                  </Text>
                </HStack>

                <Button
                  colorScheme="blue"
                  size={{ base: "sm", md: "sm" }}
                  onClick={handleCompleteTransaction}
                  isDisabled={!canCompleteTransaction}
                  w={{ base: "100%", md: "auto" }}
                >
                  取引を完了する
                </Button>
              </VStack>
            )}

            {memorizeChatItemData.status === "pending" && (
              <Button
                colorScheme="red"
                variant="outline"
                size={{ base: "sm", md: "sm" }}
                onClick={handleCancelTransaction}
                w={{ base: "100%", md: "auto" }}
              >
                取引をキャンセル
              </Button>
            )}
          </VStack>
        </Flex>
      </Box>

      <Box
        bg="white"
        p={{ base: 3, md: 4 }}
        borderRadius="lg"
        boxShadow="sm"
        mb={4}
      >
        <ShippingInfoDisplay
          sellerShipping={sellerShippingData}
          buyerShipping={buyerShippingData}
          sellerName={memorizeSellerUserData.name}
          buyerName={memorizeBuyerUserData.name}
        />
      </Box>

      {/* チャット画面 */}
      <Flex>
        <ChatRight />
      </Flex>

      {/* 商品詳細モーダル */}
      <ItemDetailModal
        isOpen={isItemOpen}
        onClose={onItemClose}
        itemData={memorizeChatItemData}
      />

      {/* 相手商品一覧モーダル */}
      <PartnerItemsModal
        isOpen={isPartnerItemsOpen}
        onClose={onPartnerItemsClose}
        tradeId={memorizeChatItemData.trade_id}
        partnerName={getPartnerName()}
      />

      {/* ユーザー情報モーダル */}
      <Modal isOpen={isUserOpen} onClose={onUserClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedUser === "seller" ? "交換を受ける人" : "交換したい人"}
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

      {/* 発送情報入力モーダル */}
      <Modal isOpen={isShippingOpen} onClose={onShippingClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>発送情報を入力</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>配送会社</FormLabel>
                <Select
                  placeholder="配送会社を選択"
                  value={shippingInfo.shippingCompany}
                  onChange={(e) =>
                    setShippingInfo({
                      ...shippingInfo,
                      shippingCompany: e.target.value,
                    })
                  }
                >
                  <option value="ヤマト運輸">ヤマト運輸</option>
                  <option value="佐川急便">佐川急便</option>
                  <option value="日本郵便">日本郵便</option>
                  <option value="その他">その他</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>追跡番号</FormLabel>
                <Input
                  placeholder="追跡番号を入力"
                  value={shippingInfo.trackingNumber}
                  onChange={(e) =>
                    setShippingInfo({
                      ...shippingInfo,
                      trackingNumber: e.target.value,
                    })
                  }
                />
              </FormControl>

              <Button
                colorScheme="green"
                width="full"
                onClick={handleShipping}
                isDisabled={
                  !shippingInfo.trackingNumber || !shippingInfo.shippingCompany
                }
              >
                発送完了
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Home;
