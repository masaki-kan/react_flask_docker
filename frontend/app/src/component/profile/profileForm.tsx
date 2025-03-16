import { ChangeEvent, KeyboardEvent, useState, useRef } from "react";
import {
  Stack,
  Avatar,
  VStack,
  Input,
  Wrap,
  Tag,
  FormControl,
  FormLabel,
  Select,
  Button,
  TagLabel,
  TagCloseButton,
  Image,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
} from "@chakra-ui/react";
import { HiOutlineMailOpen } from "react-icons/hi";
import { MdOutlineCategory } from "react-icons/md";
import { FaHistory, FaUpload } from "react-icons/fa";
import { GiThink } from "react-icons/gi";

const ProfileForm = () => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [tags, setTags] = useState(["Tag 1", "Tag 2"]); // 初期タグ
  const [image, setImage] = useState<string>("");
  const [imageURL, setImageURL] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");

  // 新しいタグを追加するハンドラ
  const addTag = (newTag: string) => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setInputValue("");
  };

  // タグを削除するハンドラ
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // インプットフィールドでエンターキーが押された時の処理
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); // フォームの送信を防ぐ
      addTag(inputValue.trim());
    }
  };

  // 画像ファイルが選択されたときのハンドラー
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log("ok");
    if (e.target.files === null) return;

    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target === null) return;

        setImageURL(loadEvent.target.result);
      };
      reader.readAsDataURL(file);
      setImage(file);
    }
  };

  return (
    <>
      <Stack
        alignItems={"start"}
        direction={{ base: "column", md: "row" }}
        spacing={4}
        width={"full"}
      >
        <Avatar
          size={"xl"}
          mr={4}
          name={"my name"}
          src="https://cdn.usegalileo.ai/sdxl10/014920d7-e0b4-4ffa-823a-811dd0d3cdbc.png"
        />
        <VStack align={"start"} width={"100%"}>
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
          {/* {imageURL && (
            <Image
              src={imageURL}
              alt="プロフィール画像"
              boxSize="150px"
              objectFit="cover"
              marginTop="4"
            />
          )} */}
          <FormControl>
            <FormLabel>名前</FormLabel>
            <Input placeholder="名前を入力" />
          </FormControl>
          <FormControl>
            <FormLabel>地域</FormLabel>
            <Input placeholder="大阪" />
          </FormControl>
          <FormControl>
            <FormLabel>年代</FormLabel>
            <Select placeholder="年代を選択" required w={"full"}>
              <option value="20">20代</option>
              <option value="30">30代</option>
              <option value="40">40代以上</option>
            </Select>
          </FormControl>
        </VStack>
      </Stack>

      <Stack
        alignItems={"start"}
        direction={{ base: "column", md: "row" }}
        width={"full"}
      >
        <Avatar icon={<MdOutlineCategory />} size={"xl"} mr={4} />
        <VStack align={"start"} width={"100%"}>
          <FormLabel>好きなジャンル</FormLabel>
          <Wrap>
            {tags.map((tag, index) => (
              <Tag
                size="lg"
                key={index}
                borderRadius="full"
                variant="solid"
                colorScheme="teal"
              >
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton onClick={() => removeTag(tag)} />
              </Tag>
            ))}
          </Wrap>
          <Input
            placeholder="新しいタグを追加"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </VStack>
      </Stack>

      <Stack
        alignItems={"start"}
        direction={{ base: "column", md: "row" }}
        width={"full"}
      >
        <Avatar icon={<HiOutlineMailOpen />} size={"xl"} mr={4} />
        <VStack align={"start"} width={"100%"}>
          <FormControl>
            <FormLabel>お気に入りの店情報</FormLabel>
            <Input placeholder="" />
          </FormControl>
        </VStack>
      </Stack>

      <Stack
        alignItems={"start"}
        direction={{ base: "column", md: "row" }}
        width={"full"}
      >
        <Avatar icon={<FaHistory />} size={"xl"} mr={4} />
        <VStack align={"start"} width={"100%"}>
          <FormControl>
            <FormLabel>古着歴</FormLabel>
            <NumberInput>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </VStack>
      </Stack>

      <Stack
        alignItems={"start"}
        direction={{ base: "column", md: "row" }}
        width={"full"}
      >
        <Avatar icon={<GiThink />} size={"xl"} mr={4} />
        <VStack align={"start"} width={"100%"}>
          <FormControl>
            <FormLabel>お気に入りの店情報</FormLabel>
            <Textarea placeholder="" />
          </FormControl>
        </VStack>
      </Stack>

      <Button mt={4} colorScheme="blue" type="submit">
        更新
      </Button>
    </>
  );
};

export default ProfileForm;
