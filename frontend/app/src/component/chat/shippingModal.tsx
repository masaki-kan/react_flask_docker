import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  FormControl,
  FormLabel,
  Select,
  Input,
  Button,
} from "@chakra-ui/react";
import { FC } from "react";
import { ShippingInfo } from "../../types/chatType";

type ShippingOpenType = {
  isShippingOpen: boolean;
  onShippingClose: () => void;
  shippingInfo: ShippingInfo;
  setShippingInfo: (value: React.SetStateAction<ShippingInfo>) => void;
  handleShipping: () => Promise<void>;
};

const ShippingModal: FC<ShippingOpenType> = ({
  isShippingOpen,
  onShippingClose,
  shippingInfo,
  setShippingInfo,
  handleShipping,
}) => {
  return (
    <>
      <Modal isOpen={isShippingOpen} onClose={onShippingClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>発送情報を入力</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>配送会社</FormLabel>
                <Select
                  placeholder="配送会社を選択"
                  value={shippingInfo.shippingCompany}
                  onChange={(e) =>
                    setShippingInfo({
                      ...shippingInfo,
                      shippingCompany: e.target.value,
                    })
                  }
                >
                  <option value="ヤマト運輸">ヤマト運輸</option>
                  <option value="佐川急便">佐川急便</option>
                  <option value="日本郵便">日本郵便</option>
                  <option value="その他">その他</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>追跡番号</FormLabel>
                <Input
                  placeholder="追跡番号を入力"
                  value={shippingInfo.trackingNumber}
                  onChange={(e) =>
                    setShippingInfo({
                      ...shippingInfo,
                      trackingNumber: e.target.value,
                    })
                  }
                />
              </FormControl>

              <Button
                colorScheme="green"
                width="full"
                onClick={handleShipping}
                isDisabled={
                  !shippingInfo.trackingNumber || !shippingInfo.shippingCompany
                }
              >
                発送完了
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ShippingModal;
