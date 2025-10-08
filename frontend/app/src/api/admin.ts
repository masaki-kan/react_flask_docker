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
          monthlySubscript: number;
          subscript: number;
          totalItems: number;
          totalUsers: number;
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
      },
    };
  } catch (error: unknown) {
    // const errorMessage = err instanceof Error ? err.message : "不明なエラー";
    createErrorResponse(error, "Error");
  }
};

export const getUserRegistrationDataApi = async (
  range: "year" | "month" | "week"
): Promise<
  | {
      success: boolean;
      data: Array<{ label: string; count: number }>;
    }
  | undefined
> => {
  const token = TokenManager.getAdminToken();

  if (!token) {
    createErrorResponse("Error");
    return;
  }

  try {
    const response = await fetch(`/api/dashboard/user-registrations?range=${range}`, {
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
    console.log("getUserRegistrationDataApi", data);
    return {
      success: true,
      data: data.data,
    };
  } catch (error: unknown) {
    createErrorResponse(error, "Error");
  }
};

export const getSubscriptionDataApi = async (
  range: "year" | "month" | "week",
  type: "monthly" | "yearly"
): Promise<
  | {
      success: boolean;
      data: {
        chartData: Array<{ label: string; users: number; revenue: number }>;
        stats: { totalUsers: number; totalRevenue: number };
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
    const response = await fetch(`/api/dashboard/subscription-data?range=${range}&type=${type}`, {
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
    console.log("getSubscriptionDataApi", data);
    return {
      success: true,
      data: data.data,
    };
  } catch (error: unknown) {
    createErrorResponse(error, "Error");
  }
};
