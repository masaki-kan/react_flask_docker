import { FC, useState } from "react";
import { getArchivesDataApi, getUsersListApi } from "../../../api/admin";
import { useEffectOnce } from "react-use";
import { useNavigate } from "react-router-dom";
import {
  TableContainer,
  Table,
  Thead,
  Tbody,
  Td,
  Tr,
  Th,
} from "@chakra-ui/react";
import { route } from "../../../route/routeConst";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import PagerComponent from "../parts/pagerComponent";

interface ArchiveDataType {
  archive_trade_id: number;
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
}

interface SearchFilters {
  buyer_name: string;
  seller_name: string;
  item_title: string;
  start_date: string;
  end_date: string;
}

interface UserOption {
  user_id: number;
  name: string;
}

const columnHelper = createColumnHelper<ArchiveDataType>();

const AdminArchives: FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ArchiveDataType[]>([]);
  const [usersList, setUsersList] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filters, setFilters] = useState<SearchFilters>({
    buyer_name: "",
    seller_name: "",
    item_title: "",
    start_date: "",
    end_date: "",
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const fetchArchives = async (
    pageNum: number,
    searchFilters: SearchFilters,
    isLoadMore: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getArchivesDataApi({
        page: pageNum,
        limit: 100,
        buyer_name: searchFilters.buyer_name,
        seller_name: searchFilters.seller_name,
        item_title: searchFilters.item_title,
        start_date: searchFilters.start_date,
        end_date: searchFilters.end_date,
      });

      if (response && response.success) {
        const newData = response.data.trades;
        setData(isLoadMore ? [...data, ...newData] : newData);
        setTotalCount(response.data.total);
        setHasMore(data.length + newData.length < response.data.total);
      } else {
        setError("データの取得に失敗しました");
      }
    } catch {
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersList = async () => {
    try {
      const response = await getUsersListApi();
      if (response && response.success) {
        setUsersList(response.data.users);
      }
    } catch (error) {
      console.error("ユーザーリスト取得エラー:", error);
    }
  };

  useEffectOnce(() => {
    fetchArchives(1, filters);
    fetchUsersList();
  });

  const handleSearch = () => {
    setPage(1);
    fetchArchives(1, filters);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      buyer_name: "",
      seller_name: "",
      item_title: "",
      start_date: "",
      end_date: "",
    };
    setFilters(resetFilters);
    setPage(1);
    fetchArchives(1, resetFilters);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArchives(nextPage, filters, true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ja-JP");
  };

  const columns = [
    columnHelper.accessor("trade_id", {
      header: "Trade ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("buyer_name", {
      header: "申請者",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("seller_name", {
      header: "申請を受けた人",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("item_title", {
      header: "商品名",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("created_at", {
      header: "取引開始日",
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("updated_at", {
      header: "取引完了日",
      cell: (info) => formatDate(info.getValue()),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}
        >
          完了した取引一覧
        </h1>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          総件数: {totalCount}件
        </p>

        {/* 検索フィルター */}
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
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "15px",
            }}
          >
            検索フィルター
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
                申請者（Buyer）
              </label>
              <select
                value={filters.buyer_name}
                onChange={(e) =>
                  setFilters({ ...filters, buyer_name: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
              >
                <option value="">全て</option>
                {usersList.map((user) => (
                  <option key={user.user_id} value={user.name}>
                    {user.name}
                  </option>
                ))}
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
                申請を受けた人（Seller）
              </label>
              <select
                value={filters.seller_name}
                onChange={(e) =>
                  setFilters({ ...filters, seller_name: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
              >
                <option value="">全て</option>
                {usersList.map((user) => (
                  <option key={user.user_id} value={user.name}>
                    {user.name}
                  </option>
                ))}
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
                商品名
              </label>
              <input
                type="text"
                value={filters.item_title}
                onChange={(e) =>
                  setFilters({ ...filters, item_title: e.target.value })
                }
                placeholder="Search..."
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
                開始日
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) =>
                  setFilters({ ...filters, start_date: e.target.value })
                }
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
                終了日
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) =>
                  setFilters({ ...filters, end_date: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
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
              Search
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
              Reset
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            borderRadius: "4px",
            marginBottom: "20px",
            border: "1px solid #f5c6cb",
          }}
        >
          {error}
        </div>
      )}

      {/* テーブル */}
      <div style={{ overflowX: "auto" }}>
        <TableContainer
          border="1px solid #e0e0e0"
          borderRadius="8px"
          overflow="hidden"
          boxShadow="0 2px 4px rgba(0,0,0,0.1)"
        >
          <Table>
            <Thead bg="#f8f9fa">
              {table.getHeaderGroups().map((headerGroup) => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        cursor: header.column.getCanSort()
                          ? "pointer"
                          : "default",
                        userSelect: "none",
                        padding: "16px",
                        fontSize: "14px",
                        fontWeight: "600",
                        textTransform: "none",
                        letterSpacing: "normal",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " ↑",
                          desc: " ↓",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      border: "1px solid #e0e0e0",
                      color: "#999",
                    }}
                  >
                    {loading ? "Loading..." : "No data available"}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, index) => (
                  <Tr
                    key={row.id}
                    bg={index % 2 === 0 ? "white" : "#f8f9fa"}
                    _hover={{
                      bg: "#e3f2fd",
                      transition: "background-color 0.2s ease",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      navigate(
                        `${route.adminArchiveDetail}?archive_trade_id=${row.original.archive_trade_id}`
                      );
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Td
                        key={cell.id}
                        border="1px solid #e0e0e0"
                        padding="12px"
                        fontSize="14px"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Td>
                    ))}
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </div>

      <PagerComponent
        hasMore={hasMore}
        dataLenght={data.length}
        handleLoadMore={handleLoadMore}
        loading={loading}
      />
    </div>
  );
};

export default AdminArchives;
