import { TokenManager } from "../utils/auth/tokenUtils";
import { createErrorResponse } from "../utils/alert/sweetalert2";

export const getDashboadApi = async (): Promise<
  | {
      success: boolean;
      data: {
        stats: {
          activeTrades: number;
          completedTrades: number;
          monthlyActiveTrades: number;
          monthlyCompletedTrades: number;
          monthlyGrowth: number;
          monthlyItems: number;
          totalItems: number;
          totalUsers: number;
        };
        charts: {
          itemCategories: any;
          tradeVolume: [];
          userRegistrations: Array<{ count: number; month: string }>;
        };
      };
    }
  | undefined
> => {
  const token = TokenManager.getAdminToken();

  if (!token) {
    createErrorResponse("Error");
    return;
  }
  try {
    const response = await fetch("/api/dashboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: データ取得失敗`);
    }

    const data = await response.json();
    console.log("getDashboadApi", data);
    return {
      success: true,
      data: {
        stats: data.data.stats,
        charts: data.data.charts,
      },
    };
  } catch (error: unknown) {
    // const errorMessage = err instanceof Error ? err.message : "不明なエラー";
    createErrorResponse(error, "Error");
  }
};
