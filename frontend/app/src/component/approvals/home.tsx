import { FC } from "react";
import { Heading } from "@chakra-ui/react";
import useLoading from "../../hooks/useLaoding";
import useApprovals from "../../hooks/useApprovals";
import { useEffectOnce } from "react-use";
import FullScreenSpinner from "../common/spliner/FullScreenSpinner";
import ApprovalsList from "./approvalsList";

const Home: FC = () => {
  const { getApprovalsList } = useApprovals();
  const { memorizeLoading } = useLoading();

  useEffectOnce(() => {
    getApprovalsList();
  });

  return (
    <>
      <Heading
        pl={{ md: 4, base: 0 }}
        mb={10}
        textAlign={{ base: "justify", md: "justify" }}
      >
        Approvals
      </Heading>
      {memorizeLoading && <FullScreenSpinner />}
      <ApprovalsList />
    </>
  );
};

export default Home;
