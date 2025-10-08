import { FC, useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  VStack,
  Button,
  ButtonGroup,
} from "@chakra-ui/react";
import { Bar } from "react-chartjs-2";
import { getUserRegistrationDataApi } from "../../../../api/admin";

type DateRange = "year" | "month" | "week";

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string;
  }>;
}

interface UserRegistrationChartProps {
  initialRange?: DateRange;
}

const UserRegistrationChart: FC<UserRegistrationChartProps> = ({
  initialRange = "year",
}) => {
  const [dateRange, setDateRange] = useState<DateRange>(initialRange);
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: "ユーザー登録数",
        data: [],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
    ],
  });
  const [loading, setLoading] = useState(false);

  const fetchChartData = useCallback(async (range: DateRange) => {
    setLoading(true);
    try {
      const response = await getUserRegistrationDataApi(range);
      if (response?.success) {
        const data = response.data;
        setChartData({
          labels: data.map(
            (item: { label: string; count: number }) => item.label
          ),
          datasets: [
            {
              label: getDatasetLabel(range),
              data: data.map(
                (item: { label: string; count: number }) => item.count
              ),
              backgroundColor: "rgba(59, 130, 246, 0.5)",
            },
          ],
        });
      }
    } catch (error) {
      console.error("Chart data fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getDatasetLabel = (range: DateRange): string => {
    switch (range) {
      case "year":
        return "月別ユーザー登録数";
      case "month":
        return "日別ユーザー登録数";
      case "week":
        return "日別ユーザー登録数";
      default:
        return "ユーザー登録数";
    }
  };

  const getChartTitle = (range: DateRange): string => {
    switch (range) {
      case "year":
        return "月別ユーザー登録数（過去12ヶ月）";
      case "month":
        return "日別ユーザー登録数（今月）";
      case "week":
        return "日別ユーザー登録数（過去7日）";
      default:
        return "ユーザー登録数";
    }
  };

  const handleRangeChange = (range: DateRange) => {
    setDateRange(range);
    fetchChartData(range);
  };

  useEffect(() => {
    fetchChartData(dateRange);
  }, [fetchChartData, dateRange]);

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
          stepSize: 1,
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <VStack justify="space-between" align="start">
          <Heading size="md">{getChartTitle(dateRange)}</Heading>
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

export default UserRegistrationChart;
