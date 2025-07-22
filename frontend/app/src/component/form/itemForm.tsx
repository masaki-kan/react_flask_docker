import { FC, useEffect, useState, useCallback, ChangeEvent } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
  Container,
  Grid,
  GridItem,
  Image,
  IconButton,
  useColorModeValue,
  AspectRatio,
  Icon,
  FormErrorMessage,
  Badge,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTrash, FaCamera, FaArrowLeft, FaSave } from "react-icons/fa";
import CustomBrandSelect from "../common/select/customBrandSelect";
import { itemListType } from "../../types/itemType";
import { route } from "../../route/routeConst";
import {
  postStoreProfileItemApi,
  deleteUserItemApi,
} from "../../api/profileApis";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import useAlert from "../../hooks/useAlert";
import useLoading from "../../hooks/useLaoding";
import CustomTypeSelect from "../common/select/customTypeSelect";

type ItemFormProps = {
  profileItem?: itemListType;
  ItemNumver?: string;
};

const ItemForm: FC<ItemFormProps> = ({ profileItem, ItemNumver }) => {
  const { changeLoading } = useLoading();
  const { defaultToast } = useAlert();
  const profile = useSelector((state: RootState) => state.profile);
  const navigate = useNavigate();
  const location = useLocation();

  // カラーモード対応
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  // const errorColor = useColorModeValue("red.500", "red.300");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  const [formValues, setFormValues] = useState<{
    title: string;
    description: string;
    images: (File | string)[];
    type: string;
    brand: { key: string; name: string };
  }>({
    title: "",
    description: "",
    images: [],
    type: "",
    brand: { key: "", name: "" },
  });

  const [formError, setFormError] = useState<{
    title: boolean;
    description: boolean;
    images: boolean;
    type: boolean;
    // brand: boolean;
  }>({
    title: false,
    description: false,
    images: false,
    type: false,
    // brand: false,
  });

  useEffect(() => {
    if (profileItem !== undefined) {
      setFormValues({
        title: profileItem.title,
        description: profileItem.description,
        images: profileItem.images || [],
        type: profileItem.type,
        brand: profileItem.brand,
      });
    }
  }, [profileItem]);

  const handleRemoveImageHandler = useCallback((index: number) => {
    setFormValues((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  // 改善された画像アップロード処理
  const imageChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const remainingSlots = 5 - formValues.images.length;
      if (remainingSlots <= 0) {
        defaultToast("画像は最大5枚までです");
        return;
      }

      const fileArray = Array.from(files).slice(0, remainingSlots);
      const acceptedTypes = ["image/jpeg", "image/png", "image/jpg"];
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

      // ファイルバリデーション
      const validFiles = fileArray.filter((file) => {
        if (!acceptedTypes.includes(file.type)) {
          defaultToast(`${file.name}はJPEGまたはPNG形式ではありません`);
          return false;
        }
        if (file.size > MAX_FILE_SIZE) {
          defaultToast(`${file.name}は5MBを超えています`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      // 新しい画像を追加
      setFormValues((prev) => ({
        ...prev,
        images: [...prev.images, ...validFiles],
      }));
    },
    [formValues.images.length, defaultToast]
  );

  const formChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormValues((prev) => ({
        ...prev,
        [name]: value,
      }));
      // エラーをクリア
      setFormError((prev) => ({
        ...prev,
        [name]: false,
      }));
    },
    []
  );

  const typeChange = useCallback((key: string) => {
    setFormValues((prev) => ({
      ...prev,
      type: key,
    }));
    setFormError((prev) => ({
      ...prev,
      type: false,
    }));
  }, []);

  const tagChange = useCallback((newTags: { key: string; name: string }) => {
    setFormValues((prev) => ({
      ...prev,
      brand: newTags,
    }));
    setFormError((prev) => ({
      ...prev,
      brand: false,
    }));
  }, []);

  const deleteUserItemHandler = useCallback(async () => {
    if (profileItem !== undefined) {
      const response = await deleteUserItemApi(
        profileItem?.itemId,
        Number(profile.profile.id)
      );

      if (response?.message) {
        defaultToast(response?.message);
        navigate(route.profile);
      }
    }
  }, [defaultToast, navigate, profile.profile.id, profileItem]);

  const storeItemsHandler = useCallback(async () => {
    changeLoading(true);

    // バリデーション
    const newErrors = {
      title: formValues.title.trim() === "",
      images: formValues.images.length === 0,
      description: formValues.description.trim() === "",
      type: formValues.type === "",
      // brand: formValues.brand.name.trim() === "",
    };

    setFormError(newErrors);

    if (Object.values(newErrors).some((val) => val)) {
      changeLoading(false);
      defaultToast("必須項目を入力してください");
      return;
    }

    try {
      const dateUpChange = ItemNumver !== undefined ? "update" : "insert";
      const formData = new FormData();

      formData.append("itemId", ItemNumver || "");
      formData.append("userId", profile.profile.id);
      formData.append("title", formValues.title);
      formData.append("description", formValues.description);
      formData.append("type", JSON.stringify(formValues.type));
      formData.append("brand", JSON.stringify(formValues.brand));
      formData.append("dateUpChange", dateUpChange);

      // 画像の処理
      for (let i = 0; i < formValues.images.length; i++) {
        const image = formValues.images[i];
        if (image instanceof File) {
          formData.append("images", image);
        } else if (typeof image === "string") {
          // 既存の画像URLの場合、Blobに変換
          try {
            const response = await fetch(image);
            const blob = await response.blob();
            const file = new File([blob], `existing_image_${i}.jpg`, {
              type: "image/jpeg",
            });
            formData.append("images", file);
          } catch {
            // URLから画像を取得できない場合は、そのままURLとして送信
            formData.append("images", image);
          }
        }
      }

      const response = await postStoreProfileItemApi(formData);

      if (response?.status !== false) {
        defaultToast(response?.message || "登録完了しました");
        navigate(route.profile);
      }
    } catch (error) {
      console.error("Error:", error);
      defaultToast("登録中にエラーが発生しました");
    } finally {
      changeLoading(false);
    }
  }, [
    ItemNumver,
    changeLoading,
    defaultToast,
    formValues,
    navigate,
    profile.profile.id,
  ]);

  const toProfile = useCallback(() => {
    navigate(route.profile);
  }, [navigate]);

  return (
    <Container maxW="container.xl" mb={10}>
      {/* ヘッダー */}
      <HStack justify="space-between" mb={6}>
        <HStack spacing={4}>
          <IconButton
            aria-label="戻る"
            icon={<FaArrowLeft />}
            variant="ghost"
            size="lg"
            onClick={toProfile}
          />
          <VStack align="start" spacing={0}>
            <Text fontSize="2xl" fontWeight="bold">
              {ItemNumver ? "商品編集" : "商品登録"}
            </Text>
            <Text fontSize="sm" color="gray.500">
              商品情報を入力してください
            </Text>
          </VStack>
        </HStack>
      </HStack>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        {/* 左側：基本情報 */}
        <GridItem>
          <Box
            bg={bgColor}
            p={6}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <VStack spacing={6} align="stretch">
              <FormControl isInvalid={formError.title}>
                <FormLabel fontWeight="bold">
                  商品名 <Badge colorScheme="red">必須</Badge>
                </FormLabel>
                <Input
                  placeholder="例: ヴィンテージデニムジャケット"
                  name="title"
                  maxLength={20}
                  value={formValues.title}
                  onChange={formChangeHandler}
                  size="lg"
                />
                <FormErrorMessage>商品名は必須です</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={formError.description}>
                <FormLabel fontWeight="bold">
                  商品説明 <Badge colorScheme="red">必須</Badge>
                </FormLabel>
                <Textarea
                  placeholder="商品の状態、特徴、サイズなどを詳しく記載してください"
                  name="description"
                  maxLength={100}
                  value={formValues.description}
                  onChange={formChangeHandler}
                  minH="120px"
                  size="lg"
                />
                <FormErrorMessage>商品説明は必須です</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={formError.type}>
                <FormLabel fontWeight="bold">
                  タイプ <Badge colorScheme="red">必須</Badge>
                </FormLabel>
                <CustomTypeSelect
                  value={formValues.type}
                  onChange={typeChange}
                  isInvalid={formError.type}
                />
                <FormErrorMessage>商品タイプは必須です</FormErrorMessage>
              </FormControl>

              {/* <FormControl isInvalid={formError.brand}> */}
              <FormControl>
                <FormLabel fontWeight="bold">ブランド</FormLabel>
                <CustomBrandSelect
                  tags={formValues.brand}
                  onChange={tagChange}
                />
                <FormErrorMessage>ブランドは必須です</FormErrorMessage>
              </FormControl>
            </VStack>
          </Box>
        </GridItem>

        {/* 右側：画像アップロード */}
        <GridItem>
          <Box
            bg={bgColor}
            p={6}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <FormControl isInvalid={formError.images}>
              <FormLabel fontWeight="bold">
                商品画像 <Badge colorScheme="red">必須</Badge>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  最大5枚まで（JPEG/PNG、各5MB以下）
                </Text>
              </FormLabel>

              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                {/* 既存の画像 */}
                {formValues.images.map((img, index) => {
                  const src =
                    img instanceof File ? URL.createObjectURL(img) : img;

                  return (
                    <AspectRatio ratio={1} key={index}>
                      <Box
                        position="relative"
                        borderRadius="lg"
                        overflow="hidden"
                        border="2px solid"
                        borderColor={borderColor}
                        _hover={{ borderColor: "red.400" }}
                        transition="all 0.2s"
                      >
                        <Image
                          src={src}
                          alt={`商品画像 ${index + 1}`}
                          objectFit="cover"
                          w="full"
                          h="full"
                        />
                        <IconButton
                          aria-label="削除"
                          icon={<FaTrash />}
                          size="sm"
                          colorScheme="red"
                          position="absolute"
                          top={2}
                          right={2}
                          onClick={() => handleRemoveImageHandler(index)}
                          opacity={0.8}
                          _hover={{ opacity: 1 }}
                        />
                      </Box>
                    </AspectRatio>
                  );
                })}

                {/* 追加ボタン */}
                {formValues.images.length < 4 && (
                  <AspectRatio ratio={1}>
                    <Button
                      as="label"
                      variant="outline"
                      borderStyle="dashed"
                      borderWidth={2}
                      borderColor={borderColor}
                      _hover={{
                        bg: hoverBg,
                        borderColor: "blue.400",
                      }}
                      cursor="pointer"
                      transition="all 0.2s"
                    >
                      <VStack spacing={2}>
                        <Icon as={FaCamera} boxSize={8} color="gray.400" />
                        <Text fontSize="sm" color="gray.500">
                          画像を追加
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {5 - formValues.images.length}枚追加可能
                        </Text>
                      </VStack>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={imageChangeHandler}
                        hidden
                      />
                    </Button>
                  </AspectRatio>
                )}
              </Grid>
              <FormErrorMessage>画像を1枚以上追加してください</FormErrorMessage>
            </FormControl>
          </Box>
        </GridItem>
      </Grid>

      {/* アクションボタン */}
      <HStack justify="space-between" mt={8}>
        <Button
          leftIcon={<FaTrash />}
          colorScheme="red"
          size="lg"
          onClick={deleteUserItemHandler}
          display={location.pathname === route.myItem ? "none" : "flex"}
        >
          削除
        </Button>

        <HStack spacing={4}>
          <Button size="lg" variant="outline" onClick={toProfile}>
            キャンセル
          </Button>
          <Button
            leftIcon={<FaSave />}
            colorScheme="blue"
            size="lg"
            onClick={storeItemsHandler}
            loadingText="登録中..."
          >
            {ItemNumver ? "更新" : "登録"}
          </Button>
        </HStack>
      </HStack>
    </Container>
  );
};

export default ItemForm;
