import { nanoid } from "nanoid";
import type { TableData } from "./persistence/types";

export function createDefaultTable(): TableData {
  return {
    columns: [
      { id: nanoid(6), label: "Name", kind: "text", width: 140 },
      { id: nanoid(6), label: "Status", kind: "text", width: 140 },
      { id: nanoid(6), label: "Done", kind: "checkbox", width: 100 },
    ],
    rows: [
      { id: nanoid(6), cells: ["", "In progress", "false"] },
      { id: nanoid(6), cells: ["", "Not started", "false"] },
    ],
  };
}

export function updateTableCell(
  table: TableData,
  rowIndex: number,
  columnIndex: number,
  value: string,
): TableData {
  return {
    ...table,
    rows: table.rows.map((row, index) => {
      if (index !== rowIndex) return row;
      const cells = [...row.cells];
      cells[columnIndex] = value;
      return { ...row, cells };
    }),
  };
}

export function reorderTableRows(table: TableData, rowIndex: number, direction: -1 | 1): TableData {
  const target = rowIndex + direction;
  if (target < 0 || target >= table.rows.length) return table;
  const rows = [...table.rows];
  [rows[rowIndex], rows[target]] = [rows[target]!, rows[rowIndex]!];
  return { ...table, rows };
}

export function reorderTableColumns(
  table: TableData,
  columnIndex: number,
  direction: -1 | 1,
): TableData {
  const target = columnIndex + direction;
  if (target < 0 || target >= table.columns.length) return table;
  const columns = [...table.columns];
  [columns[columnIndex], columns[target]] = [columns[target]!, columns[columnIndex]!];
  const rows = table.rows.map((row) => {
    const cells = [...row.cells];
    [cells[columnIndex], cells[target]] = [cells[target] ?? "", cells[columnIndex] ?? ""];
    return { ...row, cells };
  });
  return { columns, rows };
}
