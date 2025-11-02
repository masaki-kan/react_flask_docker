import { TableContainer, Table, Thead, Tbody, Td, Tr } from "@chakra-ui/react";
import { FC, useState } from "react";
import {
  UsersDataType,
  columnHelperItemsType,
} from "../../../types/adminTypes";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { columnUsersHelper } from "../../../utils/table/adminUsersTable";

type TableComponentProps = {
  data: UsersDataType[];
  columnHelperItems: columnHelperItemsType[];
  loading: boolean;
  route: (user_id: string) => void;
};
const TableComponent: FC<TableComponentProps> = ({
  data,
  columnHelperItems,
  loading,
  route,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns: columnUsersHelper(columnHelperItems),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
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
                    <th
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
                          {{
                            asc: "🔼",
                            desc: "🔽",
                          }[header.column.getIsSorted() as string] ?? "⬍"}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </Thead>
            <Tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columnUsersHelper(columnHelperItems).length}
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      border: "1px solid #e0e0e0",
                      color: "#999",
                    }}
                  >
                    {loading ? "読み込み中..." : "データがありません"}
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
                    onClick={() => route(row.original.user_id.toString())}
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
    </>
  );
};

export default TableComponent;
