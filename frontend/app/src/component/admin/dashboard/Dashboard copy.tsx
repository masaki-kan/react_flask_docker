import {
  Button,
  Card,
  CardHeader,
  Grid,
  Heading,
  HStack,
} from "@chakra-ui/react";
import { FC, useCallback } from "react";
import { getDashboadApi } from "../../../api/admin";

const Dashboard: FC = () => {
  const getUserData = useCallback(async () => {
    await getDashboadApi();
  }, []);

  const CardParts: FC = () => {
    return (
      <>
        <Card>
          <CardHeader>
            <Heading size="md">Client Report</Heading>
          </CardHeader>
        </Card>
      </>
    );
  };

  return (
    <>
      <Button
        onClick={() => {
          getUserData();
        }}
      >
        データ取得
      </Button>
      <Grid></Grid>
      <CardParts />
    </>
  );
};

export default Dashboard;
