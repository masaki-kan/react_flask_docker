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
    // console.log("getUserRegistrationDataApi", data);
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
    // console.log("getSubscriptionDataApi", data);
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
    // console.log("getUserDetailApi", data);
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
    // console.log("getUsersDataApi", data);
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
    // console.log("getItemsDataApi", data);
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

export const getItemDetailApi = async (
  itemId: number
): Promise<
  | {
      success: boolean;
      data: {
        item: {
          item_id: number;
          user_id: number;
          title: string;
          description: string;
          type: string;
          brand: string;
          uploaded_at: string;
          status: string;
          user_name: string;
          user_email: string;
          images: string[];
        };
        liked_users: Array<{
          user_id: number;
          user_name: string;
          user_email: string;
          liked_at: string;
        }>;
        like_count: number;
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
      `/api/dashboard/item-detail?item_id=${itemId}`,
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
    // console.log("getItemDetailApi", data);
    return {
      success: true,
      data: data.data,
    };
  } catch (error: unknown) {
    createErrorResponse(error, "Error");
  }
};

export const getTradesDataApi = async (params?: {
  page?: number;
  limit?: number;
  buyer_name?: string;
  seller_name?: string;
  item_title?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
}): Promise<
  | {
      success: boolean;
      data: {
        trades: Array<{
          trade_id: number;
          item_id: number;
          buyer_id: number;
          seller_id: number;
          created_at: string;
          status: string;
          item_title: string;
          seller_name: string;
          buyer_name: string;
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
    if (params?.buyer_name) queryParams.append("buyer_name", params.buyer_name);
    if (params?.seller_name)
      queryParams.append("seller_name", params.seller_name);
    if (params?.item_title) queryParams.append("item_title", params.item_title);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.start_date) queryParams.append("start_date", params.start_date);
    if (params?.end_date) queryParams.append("end_date", params.end_date);

    const url = `/api/dashboard/trades-data${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

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
    // console.log("getTradesDataApi", data);
    return {
      success: true,
      data: {
        trades: data.data.trades,
        total: data.data.total || data.data.trades.length,
      },
    };
  } catch (error: unknown) {
    createErrorResponse(error, "Error");
  }
};

export const getUsersListApi = async (): Promise<
  | {
      success: boolean;
      data: {
        users: Array<{
          user_id: number;
          name: string;
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
    const response = await fetch("/api/dashboard/users-list", {
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
    // console.log("getUsersListApi", data);
    return {
      success: true,
      data: data.data,
    };
  } catch (error: unknown) {
    createErrorResponse(error, "Error");
  }
};

export const getTradeDetailApi = async (
  tradeId: number
): Promise<
  | {
      success: boolean;
      data: {
        trade: {
          trade_id: number;
          item_id: number;
          buyer_id: number;
          seller_id: number;
          seller_exchange_item_id: number | null;
          buyer_exchange_item_id: number | null;
          created_at: string;
          status: string;
          seller_item_title: string;
          seller_item_description: string;
          seller_item_type: string;
          seller_item_brand: string;
          seller_item_images: string[];
          seller_name: string;
          seller_email: string;
          buyer_name: string;
          buyer_email: string;
          buyer_item: {
            item_id: number;
            title: string;
            description: string;
            type: string;
            brand: string;
            images: string[];
          } | null;
          seller_exchange_item: {
            item_id: number;
            title: string;
            description: string;
            type: string;
            brand: string;
            images: string[];
          } | null;
        };
        messages: Array<{
          message_id: number;
          sender_id: number;
          sender_name: string;
          message: string;
          created_at: string;
        }>;
        shipping_info: Array<{
          shipping_id: number;
          sender_id: number;
          tracking_number: string;
          shipping_company: string;
          created_at: string;
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
      `/api/dashboard/trade-detail?trade_id=${tradeId}`,
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
    // console.log("getTradeDetailApi", data);
    return {
      success: true,
      data: data.data,
    };
  } catch (error: unknown) {
    createErrorResponse(error, "Error");
  }
};

export const getArchivesDataApi = async (params?: {
  page?: number;
  limit?: number;
  buyer_name?: string;
  seller_name?: string;
  item_title?: string;
  start_date?: string;
  end_date?: string;
}): Promise<
  | {
      success: boolean;
      data: {
        trades: Array<{
          trade_id: number;
          item_id: number;
          buyer_id: number;
          seller_id: number;
          created_at: string;
          updated_at: string;
          status: string;
          item_title: string;
          seller_name: string;
          buyer_name: string;
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
    if (params?.buyer_name) queryParams.append("buyer_name", params.buyer_name);
    if (params?.seller_name)
      queryParams.append("seller_name", params.seller_name);
    if (params?.item_title) queryParams.append("item_title", params.item_title);
    if (params?.start_date) queryParams.append("start_date", params.start_date);
    if (params?.end_date) queryParams.append("end_date", params.end_date);

    const url = `/api/dashboard/archives-data${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

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
    // console.log("getArchivesDataApi", data);
    return {
      success: true,
      data: {
        trades: data.data.trades,
        total: data.data.total || data.data.trades.length,
      },
    };
  } catch (error: unknown) {
    createErrorResponse(error, "Error");
  }
};

export const getArchiveDetailApi = async (
  archiveTradeId: number
): Promise<
  | {
      success: boolean;
      data: {
        trade: {
          archive_trade_id: number;
          original_trade_id: number;
          item_archive_id: number;
          seller_id: number;
          buyer_id: number;
          seller_exchange_item_archive_id: number | null;
          buyer_exchange_item_archive_id: number | null;
          status: string;
          created_at: string;
          updated_at: string;
          seller_name: string;
          seller_email: string;
          buyer_name: string;
          buyer_email: string;
          seller_item_title: string;
          seller_item_description: string;
          seller_item_type: string;
          seller_item_brand: string;
          seller_item_images: string[];
          buyer_item: {
            archive_id: number;
            title: string;
            description: string;
            type: string;
            brand: string;
            images: string[];
          } | null;
          seller_exchange_item: {
            archive_id: number;
            title: string;
            description: string;
            type: string;
            brand: string;
            images: string[];
          } | null;
        };
        messages: Array<{
          message_id: number;
          sender_id: number;
          sender_name: string;
          message: string;
          created_at: string;
        }>;
        shipping_info: Array<{
          shipping_id: number;
          sender_id: number;
          tracking_number: string;
          shipping_company: string;
          created_at: string;
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
      `/api/dashboard/archive-detail?archive_trade_id=${archiveTradeId}`,
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
    // console.log("getArchiveDetailApi", data);
    return {
      success: true,
      data: data.data,
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
    // console.log("deleteItemApi", data);
    return {
      success: true,
      message: data.message || "商品を削除しました",
    };
  } catch (error: unknown) {
    createErrorResponse(error, "Error");
  }
};
