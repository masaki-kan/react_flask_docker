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
    const response = await fetch(
      `/api/dashboard/user-registrations?range=${range}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

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
    const response = await fetch(
      `/api/dashboard/subscription-data?range=${range}&type=${type}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

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

export const getUserDetailApi = async (
  userId: number
): Promise<
  | {
      success: boolean;
      data: {
        profile: {
          user_id: number;
          name: string;
          email: string;
          plan: string;
          created_at: string;
          updated_at: string;
          is_deleted: number;
          type: number;
        };
        items: Array<{
          item_id: number;
          title: string;
          price: number;
          status: string;
          uploaded_at: string;
          updated_at: string;
        }>;
        trades: Array<{
          trade_id: number;
          item_id: number;
          created_at: string;
          status: string;
          item_name: string;
          price: number;
          seller_name: string;
          buyer_name: string;
        }>;
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
    const response = await fetch(
      `/api/dashboard/user-detail?user_id=${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: データ取得失敗`);
    }

    const data = await response.json();
    console.log("getUserDetailApi", data);
    return {
      success: true,
      data: data.data,
    };
  } catch (error: unknown) {
    createErrorResponse(error, "Error");
  }
};

export const getUsersDataApi = async (params?: {
  page?: number;
  limit?: number;
  name?: string;
  email?: string;
  plan?: string;
  itemCount?: string;
  deleted?: string;
}): Promise<
  | {
      success: boolean;
      data: {
        users: Array<{
          created_at: string;
          email: string;
          is_deleted: number;
          item_count: number;
          name: string;
          plan: string;
          updated_at: string;
          user_id: number;
        }>;
        total: number;
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
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.name) queryParams.append("name", params.name);
    if (params?.email) queryParams.append("email", params.email);
    if (params?.plan) queryParams.append("plan", params.plan);
    if (params?.itemCount) queryParams.append("item_count", params.itemCount);
    if (params?.deleted) queryParams.append("deleted", params.deleted);

    const url = `/api/dashboard/users-data${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
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
    console.log("getUsersDataApi", data);
    return {
      success: true,
      data: {
        users: data.data.users,
        total: data.data.total || data.data.users.length,
      },
    };
  } catch (error: unknown) {
    createErrorResponse(error, "Error");
  }
};

export const getItemsDataApi = async (params?: {
  page?: number;
  limit?: number;
  user_name?: string;
  item_id?: string;
  title?: string;
  type?: string;
  brand?: string;
}): Promise<
  | {
      success: boolean;
      data: {
        items: Array<{
          item_id: number;
          user_id: number;
          user_name: string;
          title: string;
          type: string;
          brand: string;
          uploaded_at: string;
          status: string;
        }>;
        total: number;
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
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.user_name) queryParams.append("user_name", params.user_name);
    if (params?.item_id) queryParams.append("item_id", params.item_id);
    if (params?.title) queryParams.append("title", params.title);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.brand) queryParams.append("brand", params.brand);

    const url = `/api/dashboard/items-data${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
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
    console.log("getItemsDataApi", data);
    return {
      success: true,
      data: {
        items: data.data.items,
        total: data.data.total || data.data.items.length,
      },
    };
  } catch (error: unknown) {
    createErrorResponse(error, "Error");
  }
};

export const deleteItemApi = async (
  itemId: number
): Promise<
  | {
      success: boolean;
      message: string;
    }
  | undefined
> => {
  const token = TokenManager.getAdminToken();
  if (!token) {
    createErrorResponse("Error");
    return;
  }

  try {
    const response = await fetch(
      `/api/dashboard/item-delete?item_id=${itemId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: 削除失敗`);
    }

    const data = await response.json();
    console.log("deleteItemApi", data);
    return {
      success: true,
      message: data.message || "商品を削除しました",
    };
  } catch (error: unknown) {
    createErrorResponse(error, "Error");
  }
};
