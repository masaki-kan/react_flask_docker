import {
  ChangeEvent,
  KeyboardEvent,
  useState,
  useRef,
  FC,
  useCallback,
} from "react";
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
} from "@chakra-ui/react";
import { FaUpload } from "react-icons/fa";
import { profileType } from "../../types/profile";
import CustomBrandsSelect from "../common/customMultipleSelect";

type ProfileIndexProps = {
  profileData: profileType;
  formSwitchEvent: () => void;
};

const ProfileForm: FC<ProfileIndexProps> = ({
  profileData,
  formSwitchEvent,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [tags, setTags] = useState<Array<{ tagKey: string; tagName: string }>>(
    profileData.tag
  ); // 初期タグ
  const [imageURL, setImageURL] = useState<string>(profileData.image);

  // インプットフィールドでエンターキーが押された時の処理
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        if (tags.length === 5) {
          alert("規定の数に達しました。");
          return;
        }
        event.preventDefault(); // フォームの送信を防ぐ

        const target = event.target as HTMLInputElement; // タイプアサーションを使用
        const newTag = target.value;

        if (newTag && tags.filter((tag) => tag.tagName !== newTag)) {
          setTags((prevTags) => [...prevTags, { tagKey: "", tagName: newTag }]);
        }
      }
    },
    [tags]
  );

  // 画像ファイルが選択されたときのハンドラー
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files === null) return;

    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result;
        if (typeof result === "string") {
          setImageURL(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagChange = (newTags: { tagKey: string; tagName: string }[]) => {
    setTags(newTags); // 直接更新
  };

  return (
    <>
      <Stack
        alignItems={"start"}
        direction={{ base: "column", md: "row" }}
        spacing={4}
        width={{ base: "full", md: "50%" }}
      >
        <Avatar size={"xl"} mr={4} name={"my name"} src={imageURL} />
        <VStack gap={10} width={"full"}>
          <VStack align={"start"} width={"100%"} spacing={5}>
            <FormLabel>プロフィール画像</FormLabel>
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
            <Input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
            <FormControl>
              <FormLabel>名前</FormLabel>
              <Input
                placeholder="名前を入力"
                value={profileData.name}
                onChange={() => {}}
              />
            </FormControl>
            <FormControl>
              <FormLabel>地域</FormLabel>
              <Input
                placeholder="大阪"
                value={profileData.location}
                onChange={() => {}}
              />
            </FormControl>
            <FormControl>
              <FormLabel>年代</FormLabel>
              <Select
                placeholder="年代を選択"
                required
                w={"full"}
                value={profileData.old}
                onChange={() => {}}
              >
                <option value="20">20代</option>
                <option value="30">30代</option>
                <option value="40">40代</option>
                <option value="40">50代</option>
                <option value="40">60代以上</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>古着歴</FormLabel>
              <NumberInput value={profileData.age} onChange={() => {}}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </VStack>
          <VStack align={"start"} width={"100%"}>
            <FormLabel>好きなブランド</FormLabel>
            <CustomBrandsSelect
              tags={tags}
              onKeyDown={handleKeyDown}
              onChange={handleTagChange}
            />
          </VStack>
          <VStack align={"start"} width={"100%"} spacing={5}>
            <FormControl>
              <FormLabel>お気に入りの店</FormLabel>
              <Input
                placeholder=""
                value={profileData.favoriteShop.name}
                onChange={() => {}}
              />
            </FormControl>
            <FormControl>
              <FormLabel>お気に入りの店情報 URL</FormLabel>
              <Input
                placeholder=""
                value={profileData.favoriteShop.url}
                onChange={() => {}}
              />
            </FormControl>
          </VStack>
          <VStack align={"start"} width={"100%"} spacing={5}>
            <FormControl>
              <FormLabel>古着にハマったきっかけ</FormLabel>
              <Textarea
                placeholder=""
                value={profileData.reasen}
                onChange={() => {}}
              />
            </FormControl>
          </VStack>
        </VStack>
      </Stack>

      <Button mt={4} colorScheme="blue" type="submit" onClick={formSwitchEvent}>
        更新
      </Button>
    </>
  );
};

export default ProfileForm;
