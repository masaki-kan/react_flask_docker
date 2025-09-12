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
  Grid,
  GridItem,
  Image,
  IconButton,
  AspectRatio,
  Icon,
  FormErrorMessage,
  Badge,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTrash, FaCamera, FaArrowLeft, FaSave } from "react-icons/fa";
import CustomBrandSelect from "../select/customBrandSelect";
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
import CustomTypeSelect from "../select/customTypeSelect";
import { renderSrc } from "../../utils/views/viewItem";
import { useAppColors } from "../../utils/theme/colorModeUtils";

type ItemFormProps = {
  profileItem?: itemListType;
  ItemNumver?: string;
};

const ItemForm: FC<ItemFormProps> = ({ profileItem, ItemNumver }) => {
  const { changeLoading, memorizeLoading } = useLoading();
  const { defaultToast } = useAlert();
  const profile = useSelector((state: RootState) => state.profile);
  const navigate = useNavigate();
  const location = useLocation();

  // カラーモード対応
  const { bgColor, borderColor, hoverBg } = useAppColors();

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
      const confirm = window.confirm("商品削除してもよろしいですか？");
      if (confirm) {
        const response = await deleteUserItemApi(
          profileItem?.itemId,
          Number(profile.profile.id)
        );
        if (response?.message) {
          defaultToast(response?.message);
          navigate(route.profile);
        }
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
      formValues.images.forEach((image, index) => {
        if (image instanceof File) {
          // 新しい画像ファイル
          formData.append("images", image);
        } else if (typeof image === "string") {
          // 既存の画像URL（編集時）
          formData.append(`existing_images[${index}]`, image);
        }
      });

      const response = await postStoreProfileItemApi(formData);

      if (response?.status !== false) {
        defaultToast(response?.message || "登録完了しました");
        navigate(route.profile);
      }
      changeLoading(false);
      return;
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
    <>
      {/* ヘッダー */}
      <HStack justify="space-between">
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
          </VStack>
        </HStack>
      </HStack>

      <Grid
        templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
        gap={6}
        px={{ base: 2, md: 4 }}
      >
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
                          src={renderSrc(img)}
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
                {formValues.images.length < 5 && (
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
      <HStack justify="space-between" mt={8} px={{ base: 2, md: 4 }}>
        <Button
          leftIcon={<FaTrash />}
          colorScheme="red"
          size="md"
          onClick={deleteUserItemHandler}
          display={location.pathname === route.myItem ? "none" : "flex"}
        >
          削除
        </Button>

        <HStack spacing={4} justify="space-between" w={"full"}>
          <Button
            leftIcon={<FaArrowLeft />}
            size="md"
            variant="outline"
            onClick={toProfile}
            bg={"white"}
          >
            戻る
          </Button>
          <Button
            leftIcon={<FaSave />}
            isLoading={memorizeLoading}
            colorScheme="blackAlpha"
            size="md"
            onClick={storeItemsHandler}
            loadingText="登録中..."
          >
            {ItemNumver ? "更新" : "登録"}
          </Button>
        </HStack>
      </HStack>
    </>
  );
};

export default ItemForm;
