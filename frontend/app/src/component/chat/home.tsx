import { FC, useState, useCallback, useMemo, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  Avatar,
  Text,
  useDisclosure,
  VStack,
  Button,
  Checkbox,
  useToast,
  Tooltip,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { FaBox, FaTruck, FaUserCircle, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { route } from "../../route/routeConst";
import { useEffectOnce } from "react-use";
import useChat from "../../hooks/useChat";
import ChatRight from "./chatRight";
import PartnerItemsModal from "./partnerItemsModal";
import ItemDetailModal from "./itemDetailModal";
import { statusView } from "../save/saveStatusView.ts";
import {
  fetchConfirmationsApi,
  saveShippingInfoWithItemApi,
  fetchExchangeItemsApi,
  completeExchangeApi,
} from "../../api/chatApi";
import ShippingInfoDisplay from "./shippingInfoDisplay";
import { shippingInfoType, ShippingInfo } from "../../types/chatType";
import UserDataModal from "./userDataModal";
import ShippingModal from "./shippingModal";
import SelectItems from "./selectItems";

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
    confirmItemReceived,
    getChatPageData,
  } = useChat();
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
    isOpen: isSellerItemOpen,
    onOpen: onSellerItemOpen,
    onClose: onSellerItemClose,
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

  const [hasSellerSelectedItem, setHasSellerSelectedItem] = useState(false);
  const [sellerSelectedItemId, setSellerSelectedItemId] = useState<
    string | null
  >(null);
  const [buyerSelectedItemId, setBuyerSelectedItemId] = useState<string | null>(
    null
  );

  // 現在のユーザーがsellerかbuyerかを判定
  const isCurrentUserSeller = useMemo(() => {
    return memorizeSellerUserData.user_id?.toString() === userIdNumber;
  }, [memorizeSellerUserData.user_id, userIdNumber]);

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

  // 確認状況を定期的にチェック
  useEffect(() => {
    const checkConfirmations = async () => {
      // 取引が完了している場合はチェックしない
      if (
        tradeIdNumber &&
        memorizeChatItemData.status === "shipped" // 完了済みは除外
      ) {
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

    // intervalの設定前にstatusをチェック
    let interval: NodeJS.Timeout | undefined;

    if (memorizeChatItemData.status === "shipped") {
      interval = setInterval(checkConfirmations, 5000); // 5秒ごとにチェック
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [tradeIdNumber, memorizeChatItemData.status, isCurrentUserSeller]);

  const checkExchangeItems = useCallback(async () => {
    if (tradeIdNumber) {
      try {
        const result = await fetchExchangeItemsApi(tradeIdNumber);

        if (result && result.exchange_items) {
          setHasSellerSelectedItem(
            !!result.exchange_items.seller_exchange_item
          );
          setSellerSelectedItemId(
            result.exchange_items.seller_exchange_item?.item_id || null
          );

          setBuyerSelectedItemId(
            result.exchange_items.buyer_exchange_item?.item_id || null
          );
        }
      } catch (error) {
        console.error("交換商品情報取得エラー:", error);
      }
    }
  }, [tradeIdNumber]);

  // 交換商品の選択状態を監視
  useEffect(() => {
    checkExchangeItems();
  }, [tradeIdNumber, memorizeChatItemData.status, checkExchangeItems]);

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

  // 受取確認処理
  const handleItemReceivedChange = useCallback(
    async (checked: boolean) => {
      if (checked && userIdNumber) {
        const confirm = window.confirm(
          "商品受け取り完了してもよろしいですか？"
        );
        if (confirm) {
          await confirmItemReceived(
            memorizeChatItemData.trade_id,
            userIdNumber
          );
          setHasUserConfirmed(true);

          toast({
            title: "受取確認完了",
            description: "商品の受取を確認しました",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
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

    const confirm = window.confirm(
      "取引を完了してもよろしいですか？完了後は取引履歴に保存されます。"
    );
    if (confirm) {
      try {
        // 交換完了処理を実行
        await completeExchangeApi(
          memorizeChatItemData.trade_id,
          String(memorizeSellerUserData.user_id)
        );

        toast({
          title: "交換完了",
          description: "商品の交換が完了しました",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        navigate(route.saved);
      } catch (error) {
        console.error("交換完了エラー:", error);
      }
    }
  }, [
    canCompleteTransaction,
    memorizeChatItemData.trade_id,
    memorizeSellerUserData.user_id,
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
      navigate(route.saved);
    }
  }, [memorizeChatItemData.trade_id, tradeStatusChangeHandler, navigate]);

  // 発送処理を更新
  const handleShipping = useCallback(async () => {
    if (isCurrentUserSeller && sellerSelectedItemId === null) return;
    try {
      await saveShippingInfoWithItemApi(
        memorizeChatItemData.trade_id,
        userIdNumber!,
        shippingInfo.trackingNumber,
        shippingInfo.shippingCompany
      );

      onShippingClose();

      // 発送情報をクリア
      setShippingInfo({
        trackingNumber: "",
        shippingCompany: "",
      });

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
      toast({
        title: "エラー",
        description: "発送情報の登録に失敗しました",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [
    memorizeChatItemData.trade_id,
    userIdNumber,
    shippingInfo,
    onShippingClose,
    toast,
    getChatPageData,
    isCurrentUserSeller,
    sellerSelectedItemId,
  ]);

  const selectedSellerItem = useCallback(() => {
    return memorizePartnerItems.find(
      (item) => item.item_id === Number(sellerSelectedItemId)
    );
  }, [memorizePartnerItems, sellerSelectedItemId]);

  // 🔥 リダイレクト処理をHooks呼び出し後に移動
  if (tradeIdNumber === undefined || userIdNumber === undefined) {
    navigate(route.saved);
    return null;
  }

  return (
    <>
      <Box pt={24}>
        {/* ヘッダー部分：ユーザーアバターとステータス */}
        <Box bg="white" borderRadius="lg" boxShadow="sm" p={4}>
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            gap={4}
          >
            {/* ユーザーアバター */}
            <HStack spacing={4} justify={{ base: "center", md: "flex-start" }}>
              <HStack spacing={2}>
                <Tooltip label="交換したい人">
                  {memorizeBuyerUserData.profile_image?.length > 0 ? (
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
              </HStack>
              <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
                ⇄
              </Text>
              <HStack spacing={2}>
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
              </HStack>
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
                  {/* sellerの交換商品選択状態 */}
                  {isCurrentUserSeller &&
                    memorizeChatItemData.status === "pending" && (
                      <HStack>
                        <Icon
                          as={FaCheckCircle}
                          color={
                            hasSellerSelectedItem ? "green.500" : "gray.400"
                          }
                        />
                        <Text fontSize="sm">
                          交換商品:{" "}
                          {hasSellerSelectedItem ? "選択済み" : "未選択"}
                        </Text>
                      </HStack>
                    )}

                  {/* 発送状態（交換商品選択後のみ表示） */}
                  {(!isCurrentUserSeller || hasSellerSelectedItem) && (
                    <>
                      <HStack>
                        <Icon
                          as={FaTruck}
                          color={hasUserShipped ? "green.500" : "gray.400"}
                        />
                        <Text fontSize="lg">
                          あなた: {hasUserShipped ? "発送済み" : "未発送"}
                        </Text>
                      </HStack>
                      <HStack>
                        <Icon
                          as={FaTruck}
                          color={hasPartnerShipped ? "green.500" : "gray.400"}
                        />
                        <Text fontSize="lg">
                          相手: {hasPartnerShipped ? "発送済み" : "未発送"}
                        </Text>
                      </HStack>
                    </>
                  )}
                </VStack>
              )}

              {/* ステータスに応じたアクションボタン */}
              {memorizeChatItemData.status === "pending" &&
                isCurrentUserSeller &&
                !hasSellerSelectedItem && (
                  <Button
                    variant="solid"
                    size={{ base: "sm", md: "sm" }}
                    onClick={onPartnerItemsOpen}
                    leftIcon={<FaBox />}
                    w={{ base: "100%", md: "auto" }}
                  >
                    交換商品を選択する
                  </Button>
                )}

              {memorizeChatItemData.status === "pending" &&
                !hasUserShipped &&
                (!isCurrentUserSeller || hasSellerSelectedItem) && (
                  <Button
                    leftIcon={<FaTruck />}
                    colorScheme="green"
                    size={{ base: "sm", md: "sm" }}
                    onClick={onShippingOpen}
                    w={{ base: "100%", md: "auto" }}
                    isDisabled={isCurrentUserSeller && !hasSellerSelectedItem}
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
                        <Icon
                          as={FaCheckCircle}
                          color="green.500"
                          boxSize={4}
                        />
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

                  {/* 交換受理者（seller）のみ取引完了ボタンを表示 */}
                  {isCurrentUserSeller ? (
                    <Button
                      colorScheme="blue"
                      size={{ base: "sm", md: "sm" }}
                      onClick={handleCompleteTransaction}
                      isDisabled={!canCompleteTransaction}
                      w={{ base: "100%", md: "auto" }}
                    >
                      取引を完了する
                    </Button>
                  ) : (
                    // 交換申請者（buyer）には待機メッセージを表示
                    canCompleteTransaction && (
                      <Box
                        p={3}
                        bg="blue.50"
                        borderRadius="md"
                        borderLeft="4px solid"
                        borderColor="blue.400"
                      >
                        <HStack spacing={2}>
                          <Icon as={FaCheckCircle} color="blue.500" />
                          <Text fontSize="sm" color="blue.700">
                            両者の受取確認が完了しました。
                            <br />
                            交換受理者が取引を完了するまでお待ちください。
                            <br />
                            完了後は取引履歴で確認できます。
                          </Text>
                        </HStack>
                      </Box>
                    )
                  )}
                </VStack>
              )}

              {!hasSellerSelectedItem && (
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

          {/* 交換商品表示 Buyerの交換商品  交換商品表示 Sellerの交換商品  */}
          <SelectItems
            buyerSelectedItemId={buyerSelectedItemId}
            hasSellerSelectedItem={hasSellerSelectedItem}
            memorizeBuyerUserData={memorizeBuyerUserData}
            memorizeSellerUserData={memorizeSellerUserData}
            memorizeChatItemData={memorizeChatItemData}
            onItemOpen={onItemOpen}
            onSellerItemOpen={onSellerItemOpen}
            selectedSellerItem={selectedSellerItem}
          />

          <ShippingInfoDisplay
            sellerShipping={sellerShippingData}
            buyerShipping={buyerShippingData}
            sellerName={memorizeSellerUserData.name}
            buyerName={memorizeBuyerUserData.name}
          />
        </Box>

        <Text
          fontSize={"xs"}
          color={"gray.500"}
          wordBreak={"break-all"}
          mt={4}
          mb={2}
        >
          注:発送していない状態で１週間やりとりがない場合は自動でキャンセルされます。
        </Text>
        {/* チャット画面 */}
        <ChatRight />

        {/* 商品詳細モーダル */}
        <ItemDetailModal
          isOpen={isItemOpen}
          onClose={onItemClose}
          itemData={memorizeChatItemData}
        />

        {/* 受信者の選択した商品詳細モーダル */}
        <ItemDetailModal
          isOpen={isSellerItemOpen}
          onClose={onSellerItemClose}
          itemData={selectedSellerItem()}
        />

        {/* 相手商品一覧モーダル */}
        <PartnerItemsModal
          isOpen={isPartnerItemsOpen}
          onClose={onPartnerItemsClose}
          tradeId={memorizeChatItemData.trade_id}
          partnerName={getPartnerName()}
          isCurrentUserSeller={isCurrentUserSeller}
          userId={userIdNumber || ""}
          onItemSelected={() => {
            // getChatPageData(memorizeChatItemData.trade_id);
            // setHasSellerSelectedItem(true);
            window.location.reload();
          }}
        />

        {/* ユーザー情報モーダル */}
        <UserDataModal
          isUserOpen={isUserOpen}
          onUserClose={onUserClose}
          selectedUser={selectedUser}
          memorizeSellerUserData={memorizeSellerUserData}
          memorizeBuyerUserData={memorizeBuyerUserData}
        />

        {/* 発送情報入力モーダル */}
        <ShippingModal
          isShippingOpen={isShippingOpen}
          onShippingClose={onShippingClose}
          shippingInfo={shippingInfo}
          setShippingInfo={setShippingInfo}
          handleShipping={handleShipping}
        />
      </Box>
    </>
  );
};

export default Home;
