import { ChangeEvent, useState, useRef, FC, useCallback } from "react";
import {
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
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Icon,
  useColorModeValue,
  FormErrorMessage,
  IconButton,
  Badge,
} from "@chakra-ui/react";
import {
  FaUpload,
  FaUserCircle,
  FaTimes,
  FaUser,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaHeart,
  FaStore,
  FaLink,
  FaComment,
  FaCamera,
  FaSave,
} from "react-icons/fa";
import CustomBrandsSelect from "../common/select/customMultipleSelect";
import useMyProfile from "../../hooks/useProfile";
import { profileType } from "../../types/profileType";

type ProfileFormProps = {
  formStoreEvent: (formdata: profileType) => void;
  onClickFormSwitch: () => void;
};

const ProfileForm: FC<ProfileFormProps> = ({
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

  // カラーモード対応
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const sectionBg = useColorModeValue("gray.50", "gray.900");
  // const errorColor = useColorModeValue("red.500", "red.300");

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
        const resizedBase64 = canvas.toDataURL(file.type, 0.8);

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
      if (newTags.length > 5) {
        alert("最大5個まで選択可能です");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        tag: newTags,
      }));
    },
    []
  );

  const formDateChangeHandler = useCallback(
    (
      e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      const property = e.target.name;
      const value = e.target.value;

      if (property.indexOf("favoriteShop") !== -1) {
        const key = property.split("_")[1];
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
          [property]: value,
        }));
      }

      // エラーをクリア
      if (property in formError) {
        setFormError((prev) => ({
          ...prev,
          [property]: false,
        }));
      }
    },
    [formError]
  );

  const storeFormDataHandler = useCallback(() => {
    const newErrors = {
      name: formData.name.length === 0,
      location: !formData.location,
      old: formData.old === 0,
    };

    setFormError(newErrors);

    if (!Object.values(newErrors).some((val) => val)) {
      formStoreEvent(formData);
    }
  }, [formData, formStoreEvent]);

  return (
    <Container maxW="container.xl" py={8}>
      {/* ヘッダー */}
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">プロフィール編集</Heading>
        <IconButton
          aria-label="Close"
          icon={<FaTimes />}
          variant="ghost"
          onClick={onClickFormSwitch}
        />
      </HStack>

      <Grid templateColumns={{ base: "1fr", lg: "350px 1fr" }} gap={8}>
        {/* 左側 - アバター編集 */}
        <GridItem>
          <Box
            bg={bgColor}
            borderRadius="xl"
            p={6}
            boxShadow="sm"
            border="1px solid"
            borderColor={borderColor}
            position="sticky"
            top={4}
          >
            <VStack spacing={6}>
              <Text fontWeight="bold" fontSize="lg">
                プロフィール画像
              </Text>

              <Box position="relative">
                {formData.image.length > 0 ? (
                  <Avatar
                    size="2xl"
                    src={formData.image}
                    name={formData.name}
                    border="4px solid"
                    borderColor={borderColor}
                  />
                ) : (
                  <Box
                    p={8}
                    bg={sectionBg}
                    borderRadius="full"
                    border="4px solid"
                    borderColor={borderColor}
                  >
                    <Icon as={FaUserCircle} boxSize={20} color="gray.400" />
                  </Box>
                )}
                <IconButton
                  aria-label="Upload photo"
                  icon={<FaCamera />}
                  size="sm"
                  colorScheme="blue"
                  position="absolute"
                  bottom={0}
                  right={0}
                  borderRadius="full"
                  onClick={() => imageInputRef.current?.click()}
                  boxShadow="md"
                />
              </Box>

              <Button
                w="full"
                variant="outline"
                leftIcon={<FaUpload />}
                onClick={() => imageInputRef.current?.click()}
              >
                画像を変更
              </Button>

              <Input
                ref={imageInputRef}
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleImageChange}
                hidden
              />

              <Text fontSize="xs" color="gray.500" textAlign="center">
                推奨: 正方形の画像
                <br />
                最大サイズ: 800×800px
              </Text>
            </VStack>
          </Box>
        </GridItem>

        {/* 右側 - フォーム */}
        <GridItem>
          <VStack spacing={6}>
            {/* 基本情報 */}
            <Box
              bg={bgColor}
              borderRadius="xl"
              p={6}
              boxShadow="sm"
              border="1px solid"
              borderColor={borderColor}
              w="full"
            >
              <Heading size="md" mb={4}>
                基本情報
              </Heading>

              <VStack spacing={4}>
                <FormControl isInvalid={formError.name}>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Icon as={FaUser} boxSize={4} />
                      <Text>名前</Text>
                      <Badge colorScheme="red" fontSize="xs">
                        必須
                      </Badge>
                    </HStack>
                  </FormLabel>
                  <Input
                    placeholder="名前を入力"
                    value={formData.name}
                    name="name"
                    onChange={formDateChangeHandler}
                    size="lg"
                  />
                  <FormErrorMessage>名前は必須です</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={formError.location}>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Icon as={FaMapMarkerAlt} boxSize={4} />
                      <Text>地域</Text>
                      <Badge colorScheme="red" fontSize="xs">
                        必須
                      </Badge>
                    </HStack>
                  </FormLabel>
                  <Input
                    placeholder="例: 大阪"
                    name="location"
                    value={formData.location}
                    onChange={formDateChangeHandler}
                    size="lg"
                  />
                  <FormErrorMessage>地域は必須です</FormErrorMessage>
                </FormControl>

                <Grid
                  templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                  gap={4}
                  w="full"
                >
                  <FormControl isInvalid={formError.old}>
                    <FormLabel>
                      <HStack spacing={2}>
                        <Icon as={FaCalendarAlt} boxSize={4} />
                        <Text>年代</Text>
                        <Badge colorScheme="red" fontSize="xs">
                          必須
                        </Badge>
                      </HStack>
                    </FormLabel>
                    <Select
                      name="old"
                      value={formData.old || ""}
                      onChange={formDateChangeHandler}
                      size="lg"
                    >
                      <option value="0">年代を選択</option>
                      <option value="10">10代</option>
                      <option value="20">20代</option>
                      <option value="30">30代</option>
                      <option value="40">40代</option>
                      <option value="50">50代</option>
                      <option value="60">60代以上</option>
                    </Select>
                    <FormErrorMessage>年代は必須です</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>
                      <HStack spacing={2}>
                        <Icon as={FaHeart} boxSize={4} />
                        <Text>古着歴（年）</Text>
                      </HStack>
                    </FormLabel>
                    <NumberInput
                      min={1}
                      value={Number(formData.age)}
                      onChange={(valueString) => {
                        setFormData((prev) => ({
                          ...prev,
                          age: Number(valueString),
                        }));
                      }}
                      size="lg"
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </Grid>
              </VStack>
            </Box>

            {/* 好きなジャンル */}
            <Box
              bg={bgColor}
              borderRadius="xl"
              p={6}
              boxShadow="sm"
              border="1px solid"
              borderColor={borderColor}
              w="full"
            >
              <FormLabel mb={4}>
                <Heading size="md">好きなジャンル</Heading>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  最大5個まで選択可能
                </Text>
              </FormLabel>
              <CustomBrandsSelect
                tags={formData.tag}
                onChange={handleTagChange}
              />
            </Box>

            {/* お店情報 */}
            <Box
              bg={bgColor}
              borderRadius="xl"
              p={6}
              boxShadow="sm"
              border="1px solid"
              borderColor={borderColor}
              w="full"
            >
              <Heading size="md" mb={4}>
                お気に入りの店
              </Heading>

              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Icon as={FaStore} boxSize={4} />
                      <Text>店舗名</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    placeholder="店舗名を入力"
                    name="favoriteShop_name"
                    value={formData.favoriteShop.name || ""}
                    onChange={formDateChangeHandler}
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>
                    <HStack spacing={2}>
                      <Icon as={FaLink} boxSize={4} />
                      <Text>店舗URL</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    placeholder="https://example.com"
                    name="favoriteShop_url"
                    value={formData.favoriteShop.url || ""}
                    onChange={formDateChangeHandler}
                    size="lg"
                  />
                </FormControl>
              </VStack>
            </Box>

            {/* きっかけ */}
            <Box
              bg={bgColor}
              borderRadius="xl"
              p={6}
              boxShadow="sm"
              border="1px solid"
              borderColor={borderColor}
              w="full"
            >
              <FormControl>
                <FormLabel>
                  <HStack spacing={2}>
                    <Icon as={FaComment} boxSize={4} />
                    <Heading size="md">古着にハマったきっかけ</Heading>
                  </HStack>
                </FormLabel>
                <Textarea
                  name={"reasen"}
                  placeholder=""
                  value={formData.reasen}
                  onChange={(e) => {
                    formDateChangeHandler(e);
                  }}
                />
              </FormControl>
            </Box>

            <HStack justify="space-between" w="full" pt={4}>
              <Button
                size="lg"
                variant="outline"
                onClick={onClickFormSwitch}
                leftIcon={<FaTimes />}
              >
                キャンセル
              </Button>
              <Button
                size="lg"
                colorScheme="blue"
                onClick={storeFormDataHandler}
                leftIcon={<FaSave />}
              >
                変更を保存
              </Button>
            </HStack>
          </VStack>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default ProfileForm;
