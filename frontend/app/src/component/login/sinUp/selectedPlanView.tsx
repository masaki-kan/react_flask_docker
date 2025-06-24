import { Box, Text, VStack, HStack, Badge, SimpleGrid } from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { FC, memo } from "react";
import { sinupFormType, stepsStatueType } from "../../../types/loginType";
import { plans } from "../../../consts/profileConsts";

type SelectedPlanView = {
  stepStatue: stepsStatueType;
  form: sinupFormType;
  changePlanHandler: (nextValue: string) => void;
};

type PLanContentType = {
  planHead: string;
  planText: string;
  planTitle: string;
  planSub: string;
  value: string;
  formValue: string;
  click: (nextValue: string) => void;
};

const SelectedPlanView: FC<SelectedPlanView> = memo(
  ({ stepStatue, form, changePlanHandler }) => {
    if (!stepStatue.select) return null;

    const DetailTextArea: FC = () => {
      return (
        <VStack align="start" spacing={1}>
          <HStack>
            <CheckIcon color="green.400" />
            <Text fontSize="sm">出品・購入・取引が可能</Text>
          </HStack>
          <HStack>
            <CheckIcon color="green.400" />
            <Text fontSize="sm">プロフィールカスタマイズ</Text>
          </HStack>
          <HStack>
            <CheckIcon color="green.400" />
            <Text fontSize="sm">優先サポート対応</Text>
          </HStack>
        </VStack>
      );
    };

    const PLanContent: FC<PLanContentType> = ({
      planHead,
      planText,
      planTitle,
      planSub,
      formValue,
      value,
      click,
    }) => {
      return (
        <Box
          borderWidth={2}
          borderColor={formValue === value ? "blue.400" : "gray.200"}
          borderRadius="xl"
          boxShadow="base"
          p={6}
          onClick={() => click(value)}
          position="relative"
          bg="white"
          _hover={{ shadow: "md" }}
        >
          <Box
            position="absolute"
            top="-3"
            left="-2"
            bg="red.400"
            color="white"
            fontWeight="bold"
            fontSize="sm"
            px={3}
            py={1}
            borderRadius="md"
            transform="rotate(-5deg)"
            zIndex={1}
          >
            🎉 {planHead}
          </Box>

          <VStack align="start" spacing={3}>
            <Badge colorScheme="blue">{planText}</Badge>
            <Text fontSize="lg" fontWeight="bold">
              {planTitle}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {planSub}
            </Text>
            <DetailTextArea />
          </VStack>
        </Box>
      );
    };

    return (
      <>
        <VStack py="3">
          <Text fontSize={"sm"} textAlign={"center"} color={"gray.500"} mb={2}>
            お好きなプランを選んで、今すぐスタートしましょう！
            <br />
            初月はどちらのプランも無料でご利用いただけます。
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={6}>
            <PLanContent
              planHead={plans[0].planContents.option}
              planTitle={plans[0].planContents.title}
              planText={plans[0].planContents.text}
              planSub={plans[0].planContents.sub}
              value={plans[0].planKey}
              formValue={form.plan}
              click={changePlanHandler}
            />
            <PLanContent
              planHead={plans[1].planContents.option}
              planTitle={plans[1].planContents.title}
              planText={plans[1].planContents.text}
              planSub={plans[1].planContents.sub}
              value={plans[1].planKey}
              formValue={form.plan}
              click={changePlanHandler}
            />
          </SimpleGrid>
        </VStack>
      </>
    );
  }
);

export default SelectedPlanView;
