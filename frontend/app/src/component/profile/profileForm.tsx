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
} from "@chakra-ui/react";
import { FaUpload } from "react-icons/fa";
import CustomBrandsSelect from "../common/select/customMultipleSelect";
import useMyProfile from "../../hooks/useProfile";
import { profileType } from "../../types/profile";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

type ProfileIndexProps = {
  formStoreEvent: (formdata: profileType) => void;
  onClickFormSwitch: () => void;
};

const ProfileForm: FC<ProfileIndexProps> = ({
  formStoreEvent,
  onClickFormSwitch,
}) => {
  const loading = useSelector((state: RootState) => state.load);
  const { memorizeProfile } = useMyProfile();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<profileType>(
    memorizeProfile.profile
  );

  console.log(formData);
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
    if (e.target.files === null) return;

    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result;
        if (typeof result === "string") {
          setFormData((prev) => ({
            ...prev,
            image: result,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
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
      location: formData.location.length > 0 ? false : true,
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
        width={{ base: "full", md: "50%" }}
      >
        <Avatar
          size={"xl"}
          mr={4}
          name={formData.name}
          src={formData.image}
          boxShadow="md"
        />
        <VStack gap={10} width={"full"}>
          <VStack align={"start"} width={"100%"} spacing={5}>
            <FormLabel>プロフィール画像</FormLabel>
            <FormLabel cursor="pointer">
              <Button
                leftIcon={<FaUpload />}
                colorScheme="teal"
                disabled={loading.load}
                onClick={() => {
                  imageInputRef.current?.click();
                }}
              >
                画像をアップロード
              </Button>
            </FormLabel>
            <Input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading.load}
              hidden
            />
            <FormControl>
              <FormLabel>名前</FormLabel>
              <Input
                isInvalid={formError.name}
                errorBorderColor="red.300"
                placeholder="名前を入力"
                value={formData.name}
                disabled={loading.load}
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
                disabled={loading.load}
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
                disabled={loading.load}
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
                isDisabled={loading.load}
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
                disabled={loading.load}
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
                disabled={loading.load}
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
                disabled={loading.load}
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
            <Button
              isLoading={loading.load}
              colorScheme="blue"
              loadingText="更新中..."
              variant="outline"
              spinnerPlacement="start"
              onClick={storeFormDataHandler}
            >
              {"更新"}
            </Button>
          </HStack>
        </VStack>
      </Stack>
    </>
  );
};

export default ProfileForm;
