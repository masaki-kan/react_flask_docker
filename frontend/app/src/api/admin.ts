import { TokenManager } from "../utils/auth/tokenUtils";
import { createErrorResponse } from "../utils/alert/sweetalert2";

export const getDashboadApi = async () => {
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
    console.log("data", data);
    return {
      success: true,
      data: {
        result: data.result,
        stats: data.stats,
        chart: data.chart,
      },
    };
  } catch (error: unknown) {
    // const errorMessage = err instanceof Error ? err.message : "不明なエラー";
    createErrorResponse(error, "Error");
  }
};
