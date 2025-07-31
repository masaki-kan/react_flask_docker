import { useState, useEffect, FC } from "react";
import {
  Image,
  Skeleton,
  Box,
  AspectRatio,
  ImageProps,
} from "@chakra-ui/react";

interface OptimizedImageProps extends Omit<ImageProps, "src"> {
  src: string;
  alt: string;
  aspectRatio?: number;
  objectFit?: "cover" | "contain";
  sizes?: string;
}

const OptimizedImage: FC<OptimizedImageProps> = ({
  src,
  alt,
  aspectRatio = 1,
  objectFit = "cover",
  sizes,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>("");

  useEffect(() => {
    // 画像URLの処理
    const processImageUrl = () => {
      if (!src) return "/placeholder.jpg";

      // S3 URL
      if (src.startsWith("https://")) {
        return src;
      }
      // ローカルURL
      if (src.startsWith("/uploads/")) {
        return `${import.meta.env.VITE_API_URL}/api${src}`;
      }
      // base64（互換性のため）
      if (src.startsWith("data:")) {
        return src;
      }
      return src;
    };

    const processedUrl = processImageUrl();
    setImageSrc(processedUrl);
  }, [src]);

  // src が空の場合は何も表示しない
  if (!imageSrc || imageSrc === "") {
    return (
      <AspectRatio ratio={aspectRatio}>
        <Box bg="gray.100" />
      </AspectRatio>
    );
  }

  return (
    <AspectRatio ratio={aspectRatio}>
      <Box position="relative" w="full" h="full">
        {isLoading && !hasError && (
          <Skeleton position="absolute" top={0} left={0} right={0} bottom={0} />
        )}
        <Image
          src={imageSrc}
          alt={alt}
          objectFit={objectFit}
          opacity={isLoading ? 0 : 1}
          transition="opacity 0.3s"
          loading="lazy"
          sizes={sizes}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          fallbackSrc="/placeholder.jpg"
          {...props}
        />
      </Box>
    </AspectRatio>
  );
};

export default OptimizedImage;
