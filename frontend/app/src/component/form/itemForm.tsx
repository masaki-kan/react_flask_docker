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
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
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
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // 商品画像
  const imageChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const fileArray = Array.from(files).slice(
        0,
        5 - formValues.images.length
      );
      const acceptedTypes = ["image/jpeg", "image/png"];
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;

      const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          if (!acceptedTypes.includes(file.type)) {
            return reject("JPEGまたはPNG形式のみ対応");
          }

          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              let width = img.width;
              let height = img.height;

              if (width > height && width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              } else if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }

              const canvas = document.createElement("canvas");
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              if (!ctx) return reject("Canvasエラー");

              ctx.drawImage(img, 0, 0, width, height);
              const base64 = canvas.toDataURL(file.type, 0.8);
              resolve(base64);
            };

            img.onerror = () => reject("画像読み込みエラー");
            if (typeof reader.result === "string") {
              img.src = reader.result;
            }
          };

          reader.onerror = () => reject("ファイル読み込みエラー");
          reader.readAsDataURL(file);
        });
      };

      Promise.all(fileArray.map((file) => resizeImage(file)))
        .then((base64Images) => {
          // base64 → string[]
          const newPreview = previewImages.concat(base64Images).slice(0, 5);
          setPreviewImages(newPreview);

          // 同時に元画像データ（File）も保持したい場合はこちら
          setFormValues((prev) => ({
            ...prev,
            images: prev.images.concat(fileArray).slice(0, 5),
          }));
        })
        .catch((err) => {
          alert(`画像処理に失敗しました: ${err}`);
        });
    },
    [formValues.images, previewImages]
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
      const dateUpChange = ItemNumver !== undefined ? "update" : "insert";
      const formData = new FormData();
      formData.append("itemId", ItemNumver || "");
      formData.append("userId", profile.profile.id);
      formData.append("title", formValues.title);
      formData.append("description", formValues.description);
      formData.append("type", JSON.stringify(formValues.type));
      formData.append("brand", JSON.stringify(formValues.brand));
      formData.append("dateUpChange", dateUpChange);

      formValues.images.forEach((file) => {
        formData.append("images", file);
      });

      const response = await postStoreProfileItemApi(formData);
      changeLoading(false);
      if (response?.status !== false) {
        defaultToast(response?.message);
        navigate(route.profile);
      }
    }

    changeLoading(false);
  }, [
    ItemNumver,
    changeLoading,
    defaultToast,
    formValues.brand,
    formValues.description,
    formValues.images,
    formValues.title,
    formValues.type,
    navigate,
    profile.profile.id,
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
              {formValues.images.map((img, index) => {
                const src =
                  typeof img === "string" ? img : URL.createObjectURL(img);
                return (
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
                          h="200px"
                          w="full"
                          objectFit={"contain"}
                          borderRadius="md"
                        />
                      </Box>
                    </VStack>
                  </Box>
                );
              })}
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
