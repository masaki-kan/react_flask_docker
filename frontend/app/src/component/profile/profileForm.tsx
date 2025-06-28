import { ChangeEvent, useState, useRef, FC, useCallback } from "react";
import {
  Stack,
  Avatar,
  VStack,
  Input,
  FormControl,
  FormLabel,
  Select,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  HStack,
  Text,
  Card,
} from "@chakra-ui/react";
import { FaUpload } from "react-icons/fa";
import CustomBrandsSelect from "../common/select/customMultipleSelect";
import useMyProfile from "../../hooks/useProfile";
import { profileType } from "../../types/profileType";

type ProfileIndexProps = {
  formStoreEvent: (formdata: profileType) => void;
  onClickFormSwitch: () => void;
};

const ProfileForm: FC<ProfileIndexProps> = ({
  formStoreEvent,
  onClickFormSwitch,
}) => {
  const { memorizeProfile } = useMyProfile();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<profileType>(
    memorizeProfile.profile
  );
  const [formError, setFormError] = useState<{
    name: boolean;
    location: boolean;
    old: boolean;
  }>({
    name: false,
    location: false,
    old: false,
  });

  // 画像ファイルが選択されたときのハンドラー
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const acceptedTypes = ["image/jpeg", "image/png"];
    if (!acceptedTypes.includes(file.type)) {
      alert("JPEGまたはPNG形式の画像を選択してください。");
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result;
      if (typeof result !== "string") return;

      img.onload = () => {
        // リサイズ処理：最大幅・高さを制限
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;

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
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, width, height);
        const resizedBase64 = canvas.toDataURL(file.type, 0.8); // 画質80%

        setFormData((prev) => ({
          ...prev,
          image: resizedBase64,
        }));
      };

      img.src = result;
    };

    reader.readAsDataURL(file);
  };

  const handleTagChange = useCallback(
    (newTags: { key: string; name: string }[]) => {
      // setTags(newTags); // 直接更新
      if (newTags.length > 5) {
        alert("規定の数に達しました。");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        tag: newTags,
      }));
    },
    []
  );

  // form change
  const formDateChangeHandler = useCallback(
    (
      e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      const propaty = e.target.name;
      const value = e.target.value;

      if (propaty.indexOf("favoriteShop") != -1) {
        const key = propaty.split("_")[1];
        setFormData((prev) => ({
          ...prev,
          favoriteShop: {
            ...prev.favoriteShop,
            [key]: value,
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [propaty]: value,
        }));
      }
    },
    []
  );

  const storeFormDataHandler = useCallback(() => {
    const newErrors = {
      name: formData.name.length > 0 ? false : true,
      location: formData.location !== null ? false : true,
      old: formData.old === 0 ? true : false,
    };

    setFormError(newErrors);
    const hasError = Object.values(newErrors).some((val) => val); // 一つでも true（＝エラー）なら実行しない
    if (!hasError) {
      formStoreEvent(formData); // 🔁 更新実行
    }
  }, [formData, formStoreEvent]);

  return (
    <>
      <Stack
        alignItems={"start"}
        direction={{ base: "column", md: "row" }}
        spacing={4}
        mb={4}
        width={{ base: "100%", md: "70%" }}
      >
        <Card p={2} w={"full"}>
          <VStack gap={10} width={"full"}>
            <VStack align={"start"} width={"100%"} spacing={5}>
              <HStack justifyContent={"start"} alignItems={"center"} py={2}>
                <VStack align={"center"}>
                  <Avatar
                    size={"xl"}
                    mr={4}
                    name={formData.name}
                    src={formData.image}
                  />
                </VStack>
                <VStack align={"start"}>
                  <FormLabel cursor="pointer">
                    <Button
                      leftIcon={<FaUpload />}
                      colorScheme="teal"
                      onClick={() => {
                        imageInputRef.current?.click();
                      }}
                    >
                      画像をアップロード
                    </Button>
                  </FormLabel>
                </VStack>
              </HStack>

              <Input
                ref={imageInputRef}
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleImageChange}
                hidden
              />
              <FormControl>
                <FormLabel>名前</FormLabel>z
                <Input
                  isInvalid={formError.name}
                  errorBorderColor="red.300"
                  placeholder="名前を入力"
                  value={formData.name}
                  name={"name"}
                  onChange={(e) => {
                    formDateChangeHandler(e);
                  }}
                />
                {formError.name && (
                  <Text fontSize="sm" style={{ color: "red" }}>
                    名前は必須です。
                  </Text>
                )}
              </FormControl>
              <FormControl>
                <FormLabel>地域</FormLabel>
                <Input
                  placeholder="大阪"
                  name={"location"}
                  isInvalid={formError.location}
                  value={formData.location}
                  onChange={(e) => {
                    formDateChangeHandler(e);
                  }}
                />
                {formError.location && (
                  <Text fontSize="sm" style={{ color: "red" }}>
                    地域は必須です。
                  </Text>
                )}
              </FormControl>
              <FormControl>
                <FormLabel>年代</FormLabel>
                <Select
                  w={"full"}
                  name={"old"}
                  isInvalid={formError.old}
                  value={formData.old || ""}
                  onChange={(e) => {
                    formDateChangeHandler(e);
                  }}
                >
                  <option value="0">年代を選択</option>
                  <option value="10">10代</option>
                  <option value="20">20代</option>
                  <option value="30">30代</option>
                  <option value="40">40代</option>
                  <option value="40">50代</option>
                  <option value="40">60代以上</option>
                </Select>
                {formError.old && (
                  <Text fontSize="sm" style={{ color: "red" }}>
                    年代は必須です。
                  </Text>
                )}
              </FormControl>
              <FormControl>
                <FormLabel>古着歴（年目）</FormLabel>
                <NumberInput
                  min={1}
                  value={Number(formData.age)}
                  name={"age"}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      age: Number(e),
                    }));
                  }}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </VStack>
            <VStack align={"start"} width={"100%"}>
              <FormLabel>好きなジャンル</FormLabel>
              <CustomBrandsSelect
                tags={formData.tag}
                onChange={handleTagChange}
              />
            </VStack>
            <VStack align={"start"} width={"100%"} spacing={5}>
              <FormControl>
                <FormLabel>お気に入りの店</FormLabel>
                <Input
                  name={"favoriteShop_name"}
                  value={formData.favoriteShop.name || ""}
                  onChange={(e) => {
                    formDateChangeHandler(e);
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>お気に入りの店情報 URL</FormLabel>
                <Input
                  name={"favoriteShop_url"}
                  value={formData.favoriteShop.url || ""}
                  onChange={(e) => {
                    formDateChangeHandler(e);
                  }}
                />
              </FormControl>
            </VStack>
            <VStack align={"start"} width={"100%"} spacing={5}>
              <FormControl>
                <FormLabel>古着にハマったきっかけ</FormLabel>
                <Textarea
                  name={"reasen"}
                  placeholder=""
                  value={formData.reasen}
                  onChange={(e) => {
                    formDateChangeHandler(e);
                  }}
                />
              </FormControl>
            </VStack>
            <HStack align={"start"} width={"100%"} spacing={5}>
              <Button onClick={onClickFormSwitch}>戻る</Button>
              <Button onClick={storeFormDataHandler}>更新</Button>
            </HStack>
          </VStack>
        </Card>
      </Stack>
    </>
  );
};

export default ProfileForm;
