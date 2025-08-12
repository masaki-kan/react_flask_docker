import { FC, useState, useEffect, useCallback } from "react";
import {
  Box,
  Image,
  IconButton,
  HStack,
  useColorModeValue,
  Fade,
} from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { renderSrc } from "../../utils/views/viewItem";

type CustomImageSliderProps = {
  images: string[];
  height?: string | { base: string; md: string };
};

const CustomImageSlider: FC<CustomImageSliderProps> = ({
  images,
  height = { base: "400px", md: "500px" },
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // カラーモード対応
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const dotColor = useColorModeValue("gray.400", "gray.600");
  const activeDotColor = useColorModeValue("gray.800", "white");
  const buttonBg = useColorModeValue("whiteAlpha.800", "blackAlpha.800");
  const buttonHoverBg = useColorModeValue("white", "black");

  const handlePrevious = useCallback(() => {
    setIsImageLoading(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  const handleNext = useCallback(() => {
    setIsImageLoading(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  // キーボードイベントの処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, handleNext, handlePrevious]);

  const handleDotClick = (index: number) => {
    if (index !== currentIndex) {
      setIsImageLoading(true);
      setCurrentIndex(index);
    }
  };

  // スワイプ処理
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && images.length > 1) {
      handleNext();
    }
    if (isRightSwipe && images.length > 1) {
      handlePrevious();
    }
  };

  return (
    <Box
      position="relative"
      h={height}
      w="100%"
      bg={bgColor}
      overflow="hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* メイン画像 */}
      <Box position="relative" h="100%" w="90%" mx={"auto"}>
        {images.map((image, index) => (
          <Fade
            key={index}
            in={index === currentIndex}
            unmountOnExit
            transition={{ enter: { duration: 0.3 } }}
          >
            <Image
              src={renderSrc(image)}
              alt={`商品画像 ${index + 1}`}
              position="absolute"
              top="0"
              left="0"
              w="100%"
              h="100%"
              objectFit="contain"
              onLoad={() => setIsImageLoading(false)}
              opacity={isImageLoading ? 0.7 : 1}
              transition="opacity 0.3s"
            />
          </Fade>
        ))}
      </Box>

      {/* ナビゲーションボタン（複数画像の場合のみ表示） */}
      {images.length > 1 && (
        <>
          <IconButton
            aria-label="前の画像"
            icon={<FaChevronLeft />}
            position="absolute"
            left={{ base: 2, md: 4 }}
            top="50%"
            transform="translateY(-50%)"
            bg={buttonBg}
            backdropFilter="blur(8px)"
            _hover={{
              bg: buttonHoverBg,
              transform: "translateY(-50%) scale(1.1)",
            }}
            transition="all 0.2s"
            onClick={handlePrevious}
            size={{ base: "sm", md: "md" }}
            borderRadius="full"
            boxShadow="lg"
          />

          <IconButton
            aria-label="次の画像"
            icon={<FaChevronRight />}
            position="absolute"
            right={{ base: 2, md: 4 }}
            top="50%"
            transform="translateY(-50%)"
            bg={buttonBg}
            backdropFilter="blur(8px)"
            _hover={{
              bg: buttonHoverBg,
              transform: "translateY(-50%) scale(1.1)",
            }}
            transition="all 0.2s"
            onClick={handleNext}
            size={{ base: "sm", md: "md" }}
            borderRadius="full"
            boxShadow="lg"
          />
        </>
      )}

      {/* インジケータードット（複数画像の場合のみ表示） */}
      {images.length > 1 && (
        <HStack
          position="absolute"
          bottom={{ base: 4, md: 6 }}
          left="50%"
          transform="translateX(-50%)"
          spacing={2}
          p={3}
          bg={buttonBg}
          backdropFilter="blur(8px)"
          borderRadius="full"
          boxShadow="md"
        >
          {images.map((_, index) => (
            <Box
              key={index}
              as="button"
              w={{ base: 2, md: 2.5 }}
              h={{ base: 2, md: 2.5 }}
              borderRadius="full"
              bg={index === currentIndex ? activeDotColor : dotColor}
              transition="all 0.3s"
              _hover={{
                transform: "scale(1.2)",
                bg: index === currentIndex ? activeDotColor : "gray.500",
              }}
              onClick={() => handleDotClick(index)}
              cursor="pointer"
            />
          ))}
        </HStack>
      )}

      {/* 画像カウンター */}
      <Box
        position="absolute"
        top={{ base: 4, md: 6 }}
        left={{ base: 4, md: 6 }}
        bg={buttonBg}
        backdropFilter="blur(8px)"
        px={3}
        py={1}
        borderRadius="full"
        fontSize={{ base: "xs", md: "sm" }}
        fontWeight="medium"
        boxShadow="md"
      >
        {currentIndex + 1} / {images.length}
      </Box>

      {/* サムネイルプレビュー（オプション） */}
      {images.length > 1 && images.length <= 5 && (
        <HStack
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          p={{ base: 2, md: 4 }}
          spacing={{ base: 2, md: 3 }}
          justify="center"
          display={{ base: "none", md: "flex" }}
        >
          {images.map((image, index) => (
            <Box
              key={index}
              as="button"
              onClick={() => handleDotClick(index)}
              cursor="pointer"
              transition="all 0.2s"
              _hover={{ transform: "scale(1.05)" }}
            >
              <Image
                src={image}
                alt={`サムネイル ${index + 1}`}
                w="60px"
                h="60px"
                objectFit="cover"
                borderRadius="md"
                border="2px solid"
                borderColor={
                  index === currentIndex ? "blue.500" : "transparent"
                }
                opacity={index === currentIndex ? 1 : 0.6}
                boxShadow={index === currentIndex ? "md" : "sm"}
              />
            </Box>
          ))}
        </HStack>
      )}
    </Box>
  );
};

export default CustomImageSlider;
