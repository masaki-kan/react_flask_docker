import { useColorModeValue } from "@chakra-ui/react";

/**
 * 共通のカラーモード設定を提供するカスタムフック
 */
export const useAppColors = () => {
  return {
    // 基本背景色
    bgColor: useColorModeValue("white", "gray.800"),
    cardBg: useColorModeValue("white", "gray.800"),
    pageBg: useColorModeValue("gray.50", "gray.900"),
    
    // ボーダー色
    borderColor: useColorModeValue("gray.200", "gray.700"),
    
    // テキスト色
    textColor: useColorModeValue("gray.700", "gray.300"),
    headingColor: useColorModeValue("gray.800", "gray.100"),
    
    // インタラクション色
    hoverBg: useColorModeValue("gray.50", "gray.700"),
    
    // エラー色
    errorColor: useColorModeValue("red.500", "red.300"),
    
    // アクセント色
    accentColor: useColorModeValue("blue.500", "blue.300"),
    
    // 特別な背景色
    infoBg: useColorModeValue("blue.50", "blue.900"),
    infoBorder: useColorModeValue("blue.200", "blue.700"),
    successBg: useColorModeValue("green.50", "green.900"),
    successBorder: useColorModeValue("green.200", "green.700"),
  };
};

/**
 * 個別のカラー値を取得するためのヘルパー関数
 */
export const getColorModeValue = (lightValue: string, darkValue: string) => {
  return useColorModeValue(lightValue, darkValue);
};