import { FC } from "react";
import { Button } from "@chakra-ui/react";

type RenderButtonType = {
  clickEvent: () => void;
  title: string;
  disable?: boolean;
};

const RenderButton: FC<RenderButtonType> = ({
  clickEvent,
  title,
  disable = false,
}) => {
  return (
    <Button
      minW="84px"
      maxW={{ base: "100%", md: "480px" }}
      bg="#e68019"
      color="#181411"
      fontSize="sm"
      fontWeight="bold"
      mt="3"
      w="full"
      isDisabled={disable}
      onClick={clickEvent}
    >
      {title}
    </Button>
  );
};

export default RenderButton;
