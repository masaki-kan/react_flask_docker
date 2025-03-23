import { ChangeEvent, FC, useCallback, useState } from "react";
import {
  VStack,
  Input,
  Textarea,
  Button,
  Image,
  FormControl,
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  useToast,
  Wrap,
  Tooltip,
  Box,
  Select,
} from "@chakra-ui/react";
import { IoIosAdd } from "react-icons/io";
import { CiTrash } from "react-icons/ci";
import { route } from "../../route/routeConst";
import { useNavigate } from "react-router-dom";
import CustomSingleSelect from "../common/customSingleSelect";
import { itemParts } from "../../consts/itemConsts";

const MyItemIndex: FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [formValus, setFormValud] = useState<{
    title: string;
    description: string;
    imgs: string[];
    price: number;
    type: { typeKey: string; typeName: string };
    brand: { tagKey: string; tagName: string };
  }>({
    title: "",
    description: "",
    imgs: [],
    type: { typeKey: "", typeName: "" },
    brand: { tagKey: "", tagName: "" },
    price: 0,
  });

  const handleImageChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const imgTarget = e.target.files;
      if (imgTarget !== null) {
        const newImages = Array.from(imgTarget).map((file) =>
          URL.createObjectURL(file)
        );

        const totalImages = images.concat(newImages).slice(0, 5);
        setImages(totalImages);

        toast({
          title: "Photo added",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    },
    [images, toast]
  );
  const handleRemoveImageHandler = useCallback(
    (index: number) => {
      setImages(images.filter((_, idx) => idx !== index));

      toast({
        title: "Photo removed",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    },
    [images, toast]
  );

  const handleTagChange = useCallback(
    (newTags: { tagKey: string; tagName: string }) => {
      setFormValud((prev) => ({
        ...prev,
        brand: newTags,
      }));
    },
    []
  );

  const storeItemsHandler = useCallback(() => {
    // ここで内容保存処理
    // プロフィール戻る
    navigate(route.profile);
  }, [navigate]);

  return (
    <>
      <VStack
        align={"start"}
        w={{ base: "full", md: "50%" }}
        spacing={5}
        mb={4}
      >
        <FormControl>
          <FormLabel>Title</FormLabel>
          <Input placeholder="" value={formValus.title} onChange={() => {}} />
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            placeholder=""
            value={formValus.description}
            onChange={() => {}}
          />
        </FormControl>
      </VStack>
      <VStack spacing={5} w={"full"} align={"start"}>
        <FormControl>
          <FormLabel>Photos</FormLabel>
          <Wrap w="full" spacing="20px" justify="start">
            {images.map((src, index) => (
              <Box key={index} w={{ base: "100%", md: "250px" }}>
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
                      h="250px" // 高さを固定
                      w="full" // 幅はコンテナに合わせて調整
                      objectFit={{ base: "contain", md: "cover" }} // 画像をカバーとして設定
                      borderRadius="md"
                    />
                  </Box>
                </VStack>
              </Box>
            ))}
          </Wrap>

          {images.length < 5 && (
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
                onChange={handleImageChangeHandler}
                hidden
              />
            </Button>
          )}
        </FormControl>

        <FormControl>
          <FormLabel>タイプ</FormLabel>
          <Select
            placeholder="タイプを選択してください"
            required
            w={{ base: "100%", md: "50%" }}
            value={formValus.type.typeKey}
            onChange={() => {}}
          >
            {itemParts.map((part, index) => {
              return (
                <option value={part.typeKey} key={index}>
                  {part.typeName}
                </option>
              );
            })}{" "}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>ブランド</FormLabel>
          <Box w={{ base: "100%", md: "50%" }}>
            <CustomSingleSelect
              tags={formValus.brand}
              onChange={handleTagChange}
            />
          </Box>
        </FormControl>

        <FormControl>
          <FormLabel>Price (¥)</FormLabel>
          <NumberInput
            value={formValus.price}
            onChange={() => {}}
            w={{ base: "100%", md: "50%" }}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <Button
          colorScheme="orange"
          size="lg"
          justifyContent="center"
          onClick={storeItemsHandler}
        >
          登録
        </Button>
      </VStack>
    </>
  );
};

export default MyItemIndex;
