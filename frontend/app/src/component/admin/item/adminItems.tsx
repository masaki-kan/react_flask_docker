import { FC, useState } from "react";
import { getItemsDataApi, deleteItemApi } from "../../../api/admin";
import { ItemsDataType } from "../../../types/adminTypes";
import { useEffectOnce } from "react-use";
import { useNavigate } from "react-router-dom";
import {
  TableContainer,
  Table,
  Thead,
  Tbody,
  Td,
  Tr,
  Button,
  Th,
} from "@chakra-ui/react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import PagerComponent from "../parts/pagerComponent";
import Swal from "sweetalert2";
import { itemParts } from "../../../consts/itemConsts";
import { brandList } from "../../../consts/brandListi";
import { route } from "../../../route/routeConst";
import { formatType, formatBrand } from "../../admin/common/formatViews";

interface SearchFilters {
  user_name: string;
  item_id: string;
  title: string;
  type: string;
  brand: string;
}

const columnHelper = createColumnHelper<ItemsDataType>();

const AdminItems: FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ItemsDataType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filters, setFilters] = useState<SearchFilters>({
    user_name: "",
    item_id: "",
    title: "",
    type: "",
    brand: "",
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  const fetchItems = async (
    pageNum: number,
    searchFilters: SearchFilters,
    isLoadMore: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getItemsDataApi({
        page: pageNum,
        limit: 50,
        ...searchFilters,
      });

      if (response && response.success) {
        const newItems = response.data.items;
        setData(isLoadMore ? [...data, ...newItems] : newItems);
        setTotalCount(response.data.total || newItems.length);
        setHasMore(newItems.length === 50);
      } else {
        setError("Data fetch failed");
      }
    } catch {
      setError("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffectOnce(() => {
    setPage(1);
    setData([]);
    fetchItems(1, filters, false);
  });

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchItems(nextPage, filters, true);
  };

  const handleSearch = () => {
    setPage(1);
    setData([]);
    fetchItems(1, filters, false);
  };

  const handleReset = () => {
    const emptyFilters = {
      user_name: "",
      item_id: "",
      title: "",
      type: "",
      brand: "",
    };
    setFilters(emptyFilters);
    setPage(1);
    setData([]);
    fetchItems(1, emptyFilters, false);
  };

  const handleDelete = async (itemId: number) => {
    const result = await Swal.fire({
      title: "Delete Confirmation",
      text: "Are you sure you want to delete this item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await deleteItemApi(itemId);

        if (response && response.success) {
          await Swal.fire({
            title: "Delete Success",
            text: response.message,
            icon: "success",
            confirmButtonText: "OK",
          });

          setPage(1);
          setData([]);
          fetchItems(1, filters, false);
        } else {
          await Swal.fire({
            title: "Delete Failed",
            text: "Failed to delete item",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      } catch {
        await Swal.fire({
          title: "Error",
          text: "Error occurred during deletion",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ja-JP");
  };

  const columns = [
    columnHelper.accessor("item_id", {
      header: "Item ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("user_name", {
      header: "User Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("title", {
      header: "Item Title",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("type", {
      header: "Type",
      cell: (info) => formatType(info.getValue()),
    }),
    columnHelper.accessor("brand", {
      header: "Brand",
      cell: (info) => formatBrand(info.getValue()),
    }),
    columnHelper.accessor("uploaded_at", {
      header: "Created At",
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (props) => (
        <Button
          size="sm"
          colorScheme="red"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(props.row.original.item_id);
          }}
        >
          Delete
        </Button>
      ),
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
          アイテム一覧
        </h1>
        <p style={{ color: "#666" }}>
          Total: {totalCount} / Displaying: {data.length}
        </p>
      </div>

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
              User Name
            </label>
            <input
              type="text"
              value={filters.user_name}
              onChange={(e) =>
                setFilters({ ...filters, user_name: e.target.value })
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
              Item ID
            </label>
            <input
              type="text"
              value={filters.item_id}
              onChange={(e) =>
                setFilters({ ...filters, item_id: e.target.value })
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
              Item Title
            </label>
            <input
              type="text"
              value={filters.title}
              onChange={(e) =>
                setFilters({ ...filters, title: e.target.value })
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
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
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
              {itemParts.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.name}
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
              Brand Name
            </label>
            <select
              value={filters.brand}
              onChange={(e) =>
                setFilters({ ...filters, brand: e.target.value })
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
              {brandList.map((brand) => (
                <option key={brand.key} value={brand.name}>
                  {brand.name}
                </option>
              ))}
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

      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <TableContainer
          maxHeight="600px"
          overflowY="auto"
          overflowX="auto"
          bg={"white"}
        >
          <Table style={{ width: "100%", borderCollapse: "collapse" }}>
            <Thead position="sticky" top={-1} zIndex="docked">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <Th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        cursor: "pointer",
                        userSelect: "none",
                        border: "1px solid #e0e0e0",
                        padding: "12px",
                        backgroundColor: "#f8f9fa",
                        fontWeight: "600",
                        textAlign: "left",
                        fontSize: "14px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {
                            {
                              asc: "🔼",
                              desc: "🔽",
                            }[header.column.getIsSorted() as string]
                          }
                        </div>
                      )}
                    </Th>
                  ))}
                </tr>
              ))}
            </Thead>
            <Tbody>
              {table.getRowModel().rows.length === 0 ? (
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
                        `${route.adminItemDetail}?item_id=${row.original.item_id}`
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

export default AdminItems;
