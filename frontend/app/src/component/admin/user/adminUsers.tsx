import { FC, useCallback, useState } from "react";
import { getUsersDataApi } from "../../../api/admin";
import {
  columnHelperItemsType,
  UsersDataType,
} from "../../../types/adminTypes";

import { useEffectOnce } from "react-use";
import TableComponent from "../parts/tableComponent";
import PagerComponent from "../parts/pagerComponent";
import { useNavigate } from "react-router-dom";
import { route } from "../../../route/routeConst";

interface SearchFilters {
  name: string;
  email: string;
  plan: string;
  itemCount: string;
  deleted: string;
}

const AdminUsers: FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<UsersDataType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filters, setFilters] = useState<SearchFilters>({
    name: "",
    email: "",
    plan: "",
    itemCount: "",
    deleted: "",
  });

  const columnHelperItems: columnHelperItemsType[] = [
    { key: "user_id", header: "ユーザーID" },
    { key: "name", header: "ニックネーム" },
    { key: "email", header: "メールアドレス" },
    { key: "plan", header: "プラン" },
    { key: "item_count", header: "アイテム数" },
    { key: "created_at", header: "作成日時" },
    { key: "updated_at", header: "更新日時" },
    { key: "is_deleted", header: "利用状態" },
  ];

  const fetchUsers = async (
    pageNum: number,
    searchFilters: SearchFilters,
    isLoadMore: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsersDataApi({
        page: pageNum,
        limit: 50,
        ...searchFilters,
      });

      if (response && response.success) {
        const newUsers = response.data.users;
        setData(isLoadMore ? [...data, ...newUsers] : newUsers);
        setTotalCount(response.data.total || newUsers.length);
        setHasMore(newUsers.length === 100);
      } else {
        setError("データの取得に失敗しました");
      }
    } catch {
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  useEffectOnce(() => {
    setPage(1);
    setData([]);
    fetchUsers(1, filters, false);
  });

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, filters, true);
  };

  const handleSearch = () => {
    setPage(1);
    setData([]);
    fetchUsers(1, filters, false);
  };

  const adminUserDetailRoute = useCallback(
    (user_id: string) => {
      const queryParams = new URLSearchParams();
      queryParams.append("user_id", user_id);
      const url = `${route.adminUserDetail}?${queryParams.toString()}`;
      navigate(url);
    },
    [navigate]
  );

  const handleReset = () => {
    const emptyFilters = {
      name: "",
      email: "",
      plan: "",
      itemCount: "",
      deleted: "",
    };
    setFilters(emptyFilters);
    setPage(1);
    setData([]);
    fetchUsers(1, emptyFilters, false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* ヘッダー */}
      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}
        >
          ユーザー管理
        </h1>
        <p style={{ color: "#666" }}>
          全{totalCount}件 / 表示中: {data.length}件
        </p>
      </div>

      {/* 検索フォーム */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #e0e0e0",
        }}
      >
        <h2
          style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px" }}
        >
          検索フィルター
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px",
            marginBottom: "15px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              ニックネーム
            </label>
            <input
              type="text"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              placeholder="検索..."
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              メールアドレス
            </label>
            <input
              type="text"
              value={filters.email}
              onChange={(e) =>
                setFilters({ ...filters, email: e.target.value })
              }
              placeholder="検索..."
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              プラン
            </label>
            <select
              value={filters.plan}
              onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              <option value="">すべて</option>
              <option value="0">月額 990円</option>
              <option value="1">年払 9900円</option>
            </select>
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              アイテム数
            </label>
            <input
              type="number"
              value={filters.itemCount}
              onChange={(e) =>
                setFilters({ ...filters, itemCount: e.target.value })
              }
              placeholder="最小アイテム数"
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              利用状態
            </label>
            <select
              value={filters.deleted}
              onChange={(e) =>
                setFilters({ ...filters, deleted: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              <option value="">すべて</option>
              <option value="0">利用中</option>
              <option value="1">退会済</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleSearch}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            検索
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            リセット
          </button>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* テーブル */}
      <TableComponent
        data={data}
        columnHelperItems={columnHelperItems}
        loading={loading}
        route={adminUserDetailRoute}
      />

      {/* ページネーション */}
      <PagerComponent
        hasMore={hasMore}
        dataLenght={data.length}
        handleLoadMore={handleLoadMore}
        loading={loading}
      />
    </div>
  );
};

export default AdminUsers;
