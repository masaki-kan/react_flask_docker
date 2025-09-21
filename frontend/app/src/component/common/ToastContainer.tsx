import React from "react";
import {
  Box,
  Alert,
  AlertIcon,
  AlertDescription,
  CloseButton,
  VStack,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../hooks/useToast";

const MotionBox = motion(Box);

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getAlertStatus = (type: string) => {
    switch (type) {
      case "error":
        return "error";
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "info":
        return "info";
      default:
        return "info";
    }
  };

  const getAlertColorScheme = (type: string) => {
    switch (type) {
      case "error":
        return { bg: "red.50", borderColor: "red.200", color: "red.700" };
      case "success":
        return { bg: "green.50", borderColor: "green.200", color: "green.700" };
      case "warning":
        return {
          bg: "orange.50",
          borderColor: "orange.200",
          color: "orange.700",
        };
      case "info":
        return { bg: "blue.50", borderColor: "blue.200", color: "blue.700" };
      default:
        return { bg: "gray.50", borderColor: "gray.200", color: "gray.700" };
    }
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <Box
      position="fixed"
      top="20px"
      right="20px"
      zIndex={9999}
      maxWidth="400px"
      width="100%"
    >
      <VStack spacing={3} align="stretch">
        <AnimatePresence>
          {toasts.map((toast) => {
            const colors = getAlertColorScheme(toast.type);

            return (
              <MotionBox
                key={toast.id}
                initial={{ opacity: 0, x: 300, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 300, scale: 0.8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Alert
                  status={getAlertStatus(toast.type)}
                  borderRadius="md"
                  bg={colors.bg}
                  border="1px solid"
                  borderColor={colors.borderColor}
                  boxShadow="lg"
                  fontSize="sm"
                >
                  <AlertIcon color={colors.color.replace(".700", ".500")} />
                  <AlertDescription
                    flex="1"
                    color={colors.color}
                    fontSize="sm"
                    lineHeight="1.4"
                  >
                    {toast.message}
                  </AlertDescription>
                  <CloseButton
                    size="sm"
                    onClick={() => removeToast(toast.id)}
                    color={colors.color.replace(".700", ".500")}
                    _hover={{ color: colors.color }}
                    ml={2}
                  />
                </Alert>
              </MotionBox>
            );
          })}
        </AnimatePresence>
      </VStack>
    </Box>
  );
};

export default ToastContainer;
