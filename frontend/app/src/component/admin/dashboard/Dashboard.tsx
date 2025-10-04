import { FC, useEffect, useState, useCallback } from "react";
import {
  Container,
  Heading,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
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
import { Bar, Pie } from "react-chartjs-2";
import { getDashboadApi } from "../../../api/admin";

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

  const [chartData, setChartData] = useState<{
    userRegistrations: Array<{ month: string; count: number }>;
    tradeVolume: Array<any>;
    itemCategories: { [key: string]: number };
  }>({
    userRegistrations: [],
    tradeVolume: [],
    itemCategories: {},
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

        setChartData(response.data.charts);
      }
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 月別ユーザー登録数チャート
  const userChartData = {
    labels: chartData.userRegistrations.map((d) => d.month),
    datasets: [
      {
        label: "ユーザー登録数",
        data: chartData.userRegistrations.map((d) => d.count),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
    ],
  };

  // カテゴリ別アイテム数
  const categoryChartData = {
    labels: Object.keys(chartData.itemCategories),
    datasets: [
      {
        data: Object.values(chartData.itemCategories),
        backgroundColor: [
          "#EF4444",
          "#F59E0B",
          "#10B981",
          "#3B82F6",
          "#8B5CF6",
        ],
      },
    ],
  };

  return (
    <Container maxW="container.xl" py={8}>
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
                  <StatArrow
                    type={stats.monthlyGrowth > 0 ? "increase" : "decrease"}
                  />
                  {Math.abs(stats.monthlyGrowth)}%
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
                  <StatArrow
                    type={stats.monthlyItems > 0 ? "increase" : "decrease"}
                  />
                  {Math.abs(stats.monthlyItems)}%
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
                  <StatArrow
                    type={
                      stats.monthlyActiveTrades > 0 ? "increase" : "decrease"
                    }
                  />
                  {Math.abs(stats.monthlyActiveTrades)}%
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
                  <StatArrow
                    type={
                      stats.monthlyCompletedTrades > 0 ? "increase" : "decrease"
                    }
                  />
                  {Math.abs(stats.monthlyCompletedTrades)}%
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* チャート */}
      <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
        <GridItem>
          <Card>
            <CardHeader>
              <Heading size="md">月別ユーザー登録数</Heading>
            </CardHeader>
            <CardBody>
              <Bar data={userChartData} />
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <CardHeader>
              <Heading size="md">カテゴリ別アイテム数</Heading>
            </CardHeader>
            <CardBody>
              <Pie data={categoryChartData} />
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default Dashboard;
