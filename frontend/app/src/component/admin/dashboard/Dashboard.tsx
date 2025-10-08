import { FC, useEffect, useState, useCallback } from "react";
import {
  Heading,
  Grid,
  GridItem,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  HStack,
  Box,
  Button,
} from "@chakra-ui/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";
import { getDashboadApi } from "../../../api/admin";
import UserRegistrationChart from "./chart/UserRegistrationChart";
import SubscriptionChart from "./chart/SubscriptionChart";
import { useNavigate } from "react-router-dom";
import { route } from "../../../route/routeConst";
import { CiViewList } from "react-icons/ci";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const Dashboard: FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0, // ユーザー数
    totalItems: 0, // アイテム数
    activeTrades: 0, // 取引数
    completedTrades: 0, // 取引完了数
    monthlyGrowth: 0, // 月間比ユーザー数
    monthlyItems: 0, // 月間アイテム数
    monthlyActiveTrades: 0, // 月間取引数
    monthlyCompletedTrades: 0, // 月間取引完了数
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await getDashboadApi();
      if (response !== undefined && response.success === true) {
        console.log("fetchDashboardData", response.data);
        setStats({
          totalUsers: response.data.stats.totalUsers,
          totalItems: response.data.stats.totalItems,
          activeTrades: response.data.stats.activeTrades,
          completedTrades: response.data.stats.completedTrades,
          monthlyGrowth: response.data.stats.monthlyGrowth,
          monthlyItems: response.data.stats.monthlyItems,
          monthlyActiveTrades: response.data.stats.monthlyActiveTrades,
          monthlyCompletedTrades: response.data.stats.monthlyCompletedTrades,
        });
      }
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const usersViewHandler = useCallback(() => {
    navigate(route.adminUsers);
  }, [navigate]);

  const itemsViewHandler = useCallback(() => {
    navigate(route.adminUserItem);
  }, [navigate]);

  const tradeViewHandler = useCallback(() => {
    navigate(route.adminUserTrade);
  }, [navigate]);

  const archiveViewHandler = useCallback(() => {
    navigate(route.adminArchive);
  }, [navigate]);

  return (
    <>
      <Heading mb={8}>管理者ダッシュボード</Heading>
      {/* 統計カード */}
      <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={4}
        mb={8}
      >
        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>総ユーザー数</StatLabel>
                <StatNumber>{stats.totalUsers}</StatNumber>
                <StatHelpText>
                  <HStack justifyContent={"space-between"}>
                    <Box>
                      <StatArrow
                        type={stats.monthlyGrowth > 0 ? "increase" : "decrease"}
                      />
                      {Math.abs(stats.monthlyGrowth)}%
                    </Box>
                    <Button
                      leftIcon={<CiViewList />}
                      size={"xs"}
                      onClick={usersViewHandler}
                    >
                      一覧
                    </Button>
                  </HStack>
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>総アイテム数</StatLabel>
                <StatNumber>{stats.totalItems}</StatNumber>
                <StatHelpText>
                  <HStack justifyContent={"space-between"}>
                    <Box>
                      <StatArrow
                        type={stats.monthlyItems > 0 ? "increase" : "decrease"}
                      />
                      {Math.abs(stats.monthlyItems)}%
                    </Box>
                    <Button
                      leftIcon={<CiViewList />}
                      size={"xs"}
                      onClick={itemsViewHandler}
                    >
                      一覧
                    </Button>
                  </HStack>
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>進行中の取引</StatLabel>
                <StatNumber>{stats.activeTrades}</StatNumber>
                <StatHelpText>
                  <HStack justifyContent={"space-between"}>
                    <Box>
                      <StatArrow
                        type={
                          stats.monthlyActiveTrades > 0
                            ? "increase"
                            : "decrease"
                        }
                      />
                      {Math.abs(stats.monthlyActiveTrades)}%
                    </Box>
                    <Button
                      leftIcon={<CiViewList />}
                      size={"xs"}
                      onClick={tradeViewHandler}
                    >
                      一覧
                    </Button>
                  </HStack>
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>完了した取引</StatLabel>
                <StatNumber>{stats.completedTrades}</StatNumber>
                <StatHelpText>
                  <HStack justifyContent={"space-between"}>
                    <Box>
                      <StatArrow
                        type={
                          stats.monthlyCompletedTrades > 0
                            ? "increase"
                            : "decrease"
                        }
                      />
                      {Math.abs(stats.monthlyCompletedTrades)}%
                    </Box>
                    <Button
                      leftIcon={<CiViewList />}
                      size={"xs"}
                      onClick={archiveViewHandler}
                    >
                      一覧
                    </Button>
                  </HStack>
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* チャート */}
      <Grid
        templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
        gap={6}
        mb={10}
      >
        <GridItem>
          <UserRegistrationChart />
        </GridItem>
        <GridItem>
          <SubscriptionChart />
        </GridItem>
      </Grid>
    </>
  );
};

export default Dashboard;
