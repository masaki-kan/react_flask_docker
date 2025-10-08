import { FC, useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  HStack,
  Button,
  ButtonGroup,
  VStack,
  Flex,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import { Bar } from "react-chartjs-2";
import { getSubscriptionDataApi } from "../../../../api/admin";

type DateRange = "year" | "month" | "week";
type SubscriptionType = "monthly" | "yearly";

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string;
  }>;
}

interface SubscriptionStats {
  totalUsers: number;
  totalRevenue: number;
}

interface SubscriptionChartProps {
  initialRange?: DateRange;
  initialType?: SubscriptionType;
}

const SubscriptionChart: FC<SubscriptionChartProps> = ({
  initialRange = "year",
  initialType = "monthly",
}) => {
  const [dateRange, setDateRange] = useState<DateRange>(initialRange);
  const [subscriptionType, setSubscriptionType] =
    useState<SubscriptionType>(initialType);
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: "収益",
        data: [],
        backgroundColor: "rgba(34, 197, 94, 0.5)",
      },
    ],
  });
  const [stats, setStats] = useState<SubscriptionStats>({
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchChartData = useCallback(
    async (range: DateRange, type: SubscriptionType) => {
      setLoading(true);
      try {
        const response = await getSubscriptionDataApi(range, type);
        if (response?.success) {
          const data = response.data;
          setChartData({
            labels: data.chartData.map(
              (item: { label: string; users: number; revenue: number }) =>
                item.label
            ),
            datasets: [
              {
                label: getDatasetLabel(type),
                data: data.chartData.map(
                  (item: { label: string; users: number; revenue: number }) =>
                    item.revenue
                ),
                backgroundColor:
                  type === "monthly"
                    ? "rgba(34, 197, 94, 0.5)"
                    : "rgba(168, 85, 247, 0.5)",
              },
            ],
          });
          setStats({
            totalUsers: data.stats.totalUsers,
            totalRevenue: data.stats.totalRevenue,
          });
        }
      } catch (error) {
        console.error("Subscription chart data fetch error:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getDatasetLabel = (type: SubscriptionType): string => {
    switch (type) {
      case "monthly":
        return "月額サブスク収益 (円)";
      case "yearly":
        return "年払い収益 (円)";
      default:
        return "収益 (円)";
    }
  };

  const getChartTitle = (range: DateRange, type: SubscriptionType): string => {
    const typeText = type === "monthly" ? "月額" : "年払";
    switch (range) {
      case "year":
        return `${typeText}収益（過去12ヶ月）`;
      case "month":
        return `${typeText}収益（今月）`;
      case "week":
        return `${typeText}収益（過去7日）`;
      default:
        return `${typeText}収益`;
    }
  };

  const handleRangeChange = (range: DateRange) => {
    setDateRange(range);
    fetchChartData(range, subscriptionType);
  };

  const handleTypeChange = (type: SubscriptionType) => {
    setSubscriptionType(type);
    fetchChartData(dateRange, type);
  };

  useEffect(() => {
    fetchChartData(dateRange, subscriptionType);
  }, [fetchChartData, dateRange, subscriptionType]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return "¥" + Number(value).toLocaleString();
          },
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <VStack spacing={4} align="stretch">
          <VStack justify="space-between" align="start" wrap="wrap" gap={4}>
            <Heading size="md">
              {getChartTitle(dateRange, subscriptionType)}
            </Heading>
            <HStack gap={2} wrap="wrap">
              <ButtonGroup size="sm" isAttached variant="outline">
                <Button
                  isActive={subscriptionType === "monthly"}
                  onClick={() => handleTypeChange("monthly")}
                  colorScheme={
                    subscriptionType === "monthly" ? "green" : "gray"
                  }
                >
                  月額
                </Button>
                <Button
                  isActive={subscriptionType === "yearly"}
                  onClick={() => handleTypeChange("yearly")}
                  colorScheme={
                    subscriptionType === "yearly" ? "purple" : "gray"
                  }
                >
                  年払い
                </Button>
              </ButtonGroup>
              <ButtonGroup size="sm" isAttached variant="outline">
                <Button
                  isActive={dateRange === "year"}
                  onClick={() => handleRangeChange("year")}
                  colorScheme={dateRange === "year" ? "blue" : "gray"}
                >
                  1年
                </Button>
                <Button
                  isActive={dateRange === "month"}
                  onClick={() => handleRangeChange("month")}
                  colorScheme={dateRange === "month" ? "blue" : "gray"}
                >
                  1ヶ月
                </Button>
                <Button
                  isActive={dateRange === "week"}
                  onClick={() => handleRangeChange("week")}
                  colorScheme={dateRange === "week" ? "blue" : "gray"}
                >
                  1週間
                </Button>
              </ButtonGroup>
            </HStack>
          </VStack>

          {/* 統計情報 */}
          <SimpleGrid columns={{ base: 2, md: 2 }} spacing={4}>
            <Flex direction="column" bg="gray.50" p={3} borderRadius="md">
              <Text fontSize="sm" color="gray.600">
                総ユーザー数
              </Text>
              <Text fontSize="xl" fontWeight="bold" color="blue.600">
                {stats.totalUsers.toLocaleString()}人
              </Text>
            </Flex>
            <Flex direction="column" bg="gray.50" p={3} borderRadius="md">
              <Text fontSize="sm" color="gray.600">
                総収益
              </Text>
              <Text fontSize="xl" fontWeight="bold" color="green.600">
                ¥{stats.totalRevenue.toLocaleString()}
              </Text>
            </Flex>
          </SimpleGrid>
        </VStack>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div>読み込み中...</div>
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </CardBody>
    </Card>
  );
};

export default SubscriptionChart;
