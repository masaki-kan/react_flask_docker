import { FC, useEffect, useState, useCallback, ChangeEvent } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Textarea,
  Tooltip,
  VStack,
  Wrap,
  Image,
  HStack,
  Text,
  Card,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { CiTrash } from "react-icons/ci";
import { IoIosAdd } from "react-icons/io";
import { itemParts } from "../../../consts/itemConsts";
import CustomBrandSelect from "../select/customBrandSelect";
import { itemListType } from "../../../types/itemType";
import { route } from "../../../route/routeConst";
import { postStoreProfileItemApi } from "../../../api/profileApis";
import { RootState } from "../../../store";
import { useDispatch, useSelector } from "react-redux";
import useAlert from "../../../hooks/useAlert";
import { updateLoad } from "../../../store/loadingSlice";
import useLoading from "../../../hooks/useLaoding";

type ItemFormProps = {
  profileItem?: itemListType;
  ItemNumver?: string;
};

const ItemForm: FC<ItemFormProps> = ({ profileItem, ItemNumver }) => {
  const dispath = useDispatch();
  const { changeLoading } = useLoading();
  const { sweetSuccessOverAlert } = useAlert();
  const profile = useSelector((state: RootState) => state.profile);
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<{
    title: string;
    description: string;
    images: string[];
    price: number;
    type: string;
    brand: { key: string; name: string };
  }>({
    title: "",
    description: "",
    images: [],
    type: "",
    brand: { key: "", name: "" },
    price: 0,
  });

  const [formError, setFormError] = useState<{
    title: boolean;
    description: boolean;
    images: boolean;
    type: boolean;
    brand: boolean;
    price: boolean;
  }>({
    title: false,
    description: false,
    images: false,
    type: false,
    brand: false,
    price: false,
  });

  useEffect(() => {
    if (profileItem !== undefined) {
      setFormValues((prev) => ({
        ...prev,
        title: profileItem.title,
        description: profileItem.description,
        images: profileItem.images,
        price: profileItem.price,
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
      ); // 最大5枚制限

      Promise.all(
        fileArray.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === "string") {
                resolve(reader.result);
              } else {
                reject("読み込み失敗");
              }
            };
            reader.onerror = () => reject("読み込みエラー");
            reader.readAsDataURL(file);
          });
        })
      ).then((base64Images) => {
        const formattedImages = base64Images.map((img) => img);
        const totalImages = formValues.images
          .concat(formattedImages)
          .slice(0, 5);
        setFormValues((prev) => ({
          ...prev,
          images: totalImages,
        }));
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

  const tagChange = useCallback((newTags: { key: string; name: string }) => {
    setFormValues((prev) => ({
      ...prev,
      brand: newTags,
    }));
  }, []);

  const storeItemsHandler = useCallback(async () => {
    const newErrors = {
      title: formValues.title.trim() === "",
      images: formValues.images.length === 0 ? true : false,
      description: formValues.description.trim() === "",
      type: formValues.type === "",
      brand: formValues.brand.name.trim() === "",
      price: formValues.price <= 0,
    };

    setFormError(newErrors);

    const hasError = Object.values(newErrors).some((val) => val); // 一つでも true（＝エラー）なら実行しない

    if (!hasError) {
      changeLoading(true);
      // ここで内容保存処理
      const formData = {
        itemId: ItemNumver,
        userId: profile.profile.id,
        title: formValues.title,
        description: formValues.description,
        images: formValues.images,
        type: formValues.type,
        brand: formValues.brand,
        curr: "¥",
        price: formValues.price,
      };

      const dateUpChange = profileItem !== undefined ? "update" : "insert";
      const response = await postStoreProfileItemApi(formData, dateUpChange);

      if (response?.status !== false) {
        dispath(updateLoad(false));
        sweetSuccessOverAlert().then((result) => {
          if (result.isConfirmed) {
            // OK 押下時の処理
            // プロフィール戻る
            navigate(route.profile);
          }
        });
      }

      changeLoading(false);
    }
  }, [
    ItemNumver,
    changeLoading,
    dispath,
    formValues.brand,
    formValues.description,
    formValues.images,
    formValues.price,
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
                      <Image
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
            <Select
              isInvalid={formError.type}
              placeholder="タイプを選択してください"
              required
              name="type"
              w={{ base: "100%", md: "50%" }}
              value={formValues.type}
              onChange={formChangeHandler}
            >
              {itemParts.map((part, index) => {
                return (
                  <option value={part.key} key={index}>
                    {part.name}
                  </option>
                );
              })}{" "}
            </Select>
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

          <FormControl>
            <FormLabel>Price (¥)</FormLabel>
            <NumberInput
              isInvalid={formError.price}
              value={formValues.price}
              w={{ base: "100%", md: "50%" }}
              onChange={(e) => {
                setFormValues((prev) => ({
                  ...prev,
                  price: Number(e),
                }));
              }}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            {formError.brand && (
              <Text fontSize="sm" style={{ color: "red" }}>
                商品値段は必須です。
              </Text>
            )}
          </FormControl>

          <HStack align={"start"} width={"100%"} spacing={5}>
            <Button onClick={toProfile}>戻る</Button>
            <Button onClick={storeItemsHandler}>登録</Button>
          </HStack>
        </VStack>
      </Card>
    </>
  );
};

export default ItemForm;
