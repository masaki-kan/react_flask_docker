import { FC, useEffect, useState, useCallback, ChangeEvent } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Tooltip,
  VStack,
  Wrap,
  HStack,
  Text,
  Card,
  Image as ChakraImage,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { CiTrash } from "react-icons/ci";
import { IoIosAdd } from "react-icons/io";
import CustomBrandSelect from "../select/customBrandSelect";
import { itemListType } from "../../../types/itemType";
import { route } from "../../../route/routeConst";
import {
  postStoreProfileItemApi,
  deleteUserItemApi,
} from "../../../api/profileApis";
import { RootState } from "../../../store";
import { useSelector } from "react-redux";
import useAlert from "../../../hooks/useAlert";
import useLoading from "../../../hooks/useLaoding";
import CustomTypeSelect from "../select/customTypeSelect";

type ItemFormProps = {
  profileItem?: itemListType;
  ItemNumver?: string;
};

const ItemForm: FC<ItemFormProps> = ({ profileItem, ItemNumver }) => {
  const { changeLoading } = useLoading();
  const { sweetSuccessOverAlert } = useAlert();
  const profile = useSelector((state: RootState) => state.profile);
  const navigate = useNavigate();
  const location = useLocation();
  console.log(location.pathname);
  const [formValues, setFormValues] = useState<{
    title: string;
    description: string;
    images: string[];
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
    brand: boolean;
  }>({
    title: false,
    description: false,
    images: false,
    type: false,
    brand: false,
  });

  useEffect(() => {
    if (profileItem !== undefined) {
      setFormValues((prev) => ({
        ...prev,
        title: profileItem.title,
        description: profileItem.description,
        images: profileItem.images,
        type: profileItem.type,
        brand: profileItem.brand,
      }));
    }
  }, [navigate, profileItem]);

  const handleRemoveImageHandler = useCallback((index: number) => {
    setFormValues((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  }, []);

  // 商品画像
  const imageChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const fileArray = Array.from(files).slice(
        0,
        5 - formValues.images.length
      ); // 最大5枚まで

      const acceptedTypes = ["image/jpeg", "image/png"];
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;

      const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          if (!acceptedTypes.includes(file.type)) {
            return reject("JPEGまたはPNG形式の画像のみ対応しています。");
          }

          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result !== "string")
              return reject("ファイル読み込み失敗");

            const img = new Image();
            img.onload = () => {
              let width = img.width;
              let height = img.height;

              // サイズを制限
              if (width > height && width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              } else if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }

              // canvas に描画して base64 に変換
              const canvas = document.createElement("canvas");
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              if (!ctx) return reject("Canvas エラー");

              ctx.drawImage(img, 0, 0, width, height);
              const resizedBase64 = canvas.toDataURL(file.type, 0.8); // 画質 80%
              resolve(resizedBase64);
            };

            img.onerror = () => reject("画像読み込みエラー");
            img.src = reader.result;
          };

          reader.onerror = () => reject("ファイル読み込みエラー");
          reader.readAsDataURL(file);
        });
      };

      Promise.all(fileArray.map((file) => resizeImage(file)))
        .then((resizedBase64Images) => {
          const totalImages = formValues.images
            .concat(resizedBase64Images)
            .slice(0, 5); // 5枚まで
          setFormValues((prev) => ({
            ...prev,
            images: totalImages,
          }));
        })
        .catch((err) => {
          alert(`画像の処理に失敗しました: ${err}`);
        });
    },
    [formValues.images]
  );

  const formChangeHandler = useCallback(
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const name = e.target.name;
      const value = e.target.value;

      setFormValues((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const typeChange = useCallback((key: string) => {
    setFormValues((prev) => ({
      ...prev,
      type: key,
    }));
  }, []);

  const tagChange = useCallback((newTags: { key: string; name: string }) => {
    setFormValues((prev) => ({
      ...prev,
      brand: newTags,
    }));
  }, []);

  const deleteUserItemHandler = useCallback(async () => {
    changeLoading(true);

    if (profileItem !== undefined) {
      const response = await deleteUserItemApi(
        profileItem?.itemId,
        Number(profile.profile.id)
      );

      if (response?.message) {
        changeLoading(false);
        sweetSuccessOverAlert(response?.message).then((result) => {
          if (result.isConfirmed) {
            // OK 押下時の処理
            // プロフィール戻る
            navigate(route.profile);
          }
        });
      }
    }
    changeLoading(false);
  }, [
    changeLoading,
    navigate,
    profile.profile.id,
    profileItem,
    sweetSuccessOverAlert,
  ]);

  const storeItemsHandler = useCallback(async () => {
    changeLoading(true);
    const newErrors = {
      title: formValues.title.trim() === "",
      images: formValues.images.length === 0 ? true : false,
      description: formValues.description.trim() === "",
      type: formValues.type === "",
      brand: formValues.brand.name.trim() === "",
    };

    setFormError(newErrors);

    const hasError = Object.values(newErrors).some((val) => val); // 一つでも true（＝エラー）なら実行しない

    if (!hasError) {
      // ここで内容保存処理
      const formData = {
        itemId: ItemNumver,
        userId: profile.profile.id,
        title: formValues.title,
        description: formValues.description,
        images: formValues.images,
        type: formValues.type,
        brand: formValues.brand,
      };

      const dateUpChange = profileItem !== undefined ? "update" : "insert";

      const response = await postStoreProfileItemApi(formData, dateUpChange);
      changeLoading(false);
      if (response?.status !== false) {
        sweetSuccessOverAlert(response?.message).then((result) => {
          if (result.isConfirmed) {
            // OK 押下時の処理
            // プロフィール戻る
            navigate(route.profile);
          }
        });
      }
    }

    changeLoading(false);
  }, [
    ItemNumver,
    changeLoading,
    formValues.brand,
    formValues.description,
    formValues.images,
    formValues.title,
    formValues.type,
    navigate,
    profile.profile.id,
    profileItem,
    sweetSuccessOverAlert,
  ]);

  const toProfile = useCallback(() => {
    navigate(route.profile);
  }, [navigate]);

  return (
    <>
      <Card
        display={"row"}
        mb={4}
        w={"full"}
        align={"start"}
        bg={"white"}
        p={4}
      >
        <VStack
          align={"start"}
          w={{ base: "full", md: "50%" }}
          spacing={5}
          mb={4}
        >
          <FormControl>
            <FormLabel>商品名</FormLabel>
            <Input
              isInvalid={formError.title}
              placeholder=""
              name="title"
              maxLength={20}
              value={formValues.title}
              onChange={formChangeHandler}
            />
            {formError.title && (
              <Text fontSize="sm" style={{ color: "red" }}>
                商品名は必須です。
              </Text>
            )}
          </FormControl>

          <FormControl>
            <FormLabel>商品説明</FormLabel>
            <Textarea
              isInvalid={formError.description}
              placeholder=""
              name="description"
              maxLength={100}
              value={formValues.description}
              onChange={formChangeHandler}
            />
            {formError.description && (
              <Text fontSize="sm" style={{ color: "red" }}>
                商品説明は必須です。
              </Text>
            )}
          </FormControl>
        </VStack>
        <VStack spacing={5} w={"full"} align={"start"}>
          <FormControl>
            <FormLabel>商品画像</FormLabel>
            <Wrap w="full" spacing="20px" justify="start">
              {formValues.images.map((src, index) => (
                <Box key={index} w={{ base: "45%", md: "250px" }}>
                  <VStack align="end" position="relative">
                    <Tooltip label="削除" hasArrow>
                      <CiTrash
                        color="#000"
                        cursor="pointer"
                        style={{
                          width: "25px",
                          height: "25px",
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                        }}
                        onClick={() => handleRemoveImageHandler(index)}
                      />
                    </Tooltip>
                    <Box
                      width="100%"
                      p={2}
                      boxShadow="md"
                      bg="white"
                      borderRadius="md"
                    >
                      <ChakraImage
                        src={src}
                        alt={`Image ${index}`}
                        h="200px" // 高さを固定
                        w="full" // 幅はコンテナに合わせて調整
                        objectFit={"contain"} // 画像をカバーとして設定
                        borderRadius="md"
                      />
                    </Box>
                  </VStack>
                </Box>
              ))}
            </Wrap>
            {formError.images && (
              <Text fontSize="sm" style={{ color: "red" }}>
                商品画像は必須です。
              </Text>
            )}
            {formValues.images.length < 5 && (
              <Button
                leftIcon={<IoIosAdd />}
                colorScheme="gray"
                mt={4}
                size="lg"
                gap={2}
                pl={4}
                as="label"
              >
                Add photos
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={imageChangeHandler}
                  hidden
                />
              </Button>
            )}
          </FormControl>

          <FormControl>
            <FormLabel>タイプ</FormLabel>
            <CustomTypeSelect
              value={formValues.type}
              onChange={typeChange}
              isInvalid={formError.type}
            />
            {formError.type && (
              <Text fontSize="sm" style={{ color: "red" }}>
                商品タイプは必須です。
              </Text>
            )}
          </FormControl>

          <FormControl>
            <FormLabel>ブランド</FormLabel>
            <Box w={{ base: "100%", md: "50%" }}>
              <CustomBrandSelect tags={formValues.brand} onChange={tagChange} />
            </Box>
            {formError.brand && (
              <Text fontSize="sm" style={{ color: "red" }}>
                ブランドは必須です。
              </Text>
            )}
          </FormControl>
          <HStack
            align={"center"}
            justifyContent={"space-between"}
            width={"100%"}
            spacing={5}
          >
            <Button
              onClick={deleteUserItemHandler}
              colorScheme={"red"}
              color={"white"}
              hidden={location.pathname === route.myItem}
            >
              削除
            </Button>
            <HStack>
              <Button onClick={toProfile}>戻る</Button>
              <Button onClick={storeItemsHandler}>登録</Button>
            </HStack>
          </HStack>
        </VStack>
      </Card>
    </>
  );
};

export default ItemForm;
