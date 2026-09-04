import { memo, useMemo } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { Minus, Plus, Table2, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useCanvasStore } from "@/lib/store";
import type { TableColumn, TableData, TableRow } from "@/lib/persistence/types";
import { ResizeControls } from "./ResizeControls";

const initialTable = (): TableData => ({
  columns: [
    { id: nanoid(6), label: "Name", kind: "text" },
    { id: nanoid(6), label: "Status", kind: "text" },
    { id: nanoid(6), label: "Done", kind: "checkbox" },
  ],
  rows: [
    { id: nanoid(6), cells: ["", "In progress", "false"] },
    { id: nanoid(6), cells: ["", "Not started", "false"] },
  ],
});

function TableNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const reduce = useReducedMotion();
  const table = useMemo(
    () => (data.table as TableData | undefined) ?? initialTable(),
    [data.table],
  );

  const commitTable = (next: TableData, withHistory = false) => {
    (withHistory ? updateNodeDataWithHistory : updateNodeData)(id, { table: next });
  };

  const updateCell = (rowIndex: number, columnIndex: number, value: string) => {
    const rows = table.rows.map((row, index) => {
      if (index !== rowIndex) return row;
      const cells = [...row.cells];
      cells[columnIndex] = value;
      return { ...row, cells };
    });
    commitTable({ ...table, rows });
  };

  const updateColumn = (columnIndex: number, patch: Partial<TableColumn>) => {
    const columns = table.columns.map((column, index) =>
      index === columnIndex ? { ...column, ...patch } : column,
    );
    commitTable({ ...table, columns });
  };

  const addRow = () =>
    commitTable(
      { ...table, rows: [...table.rows, { id: nanoid(6), cells: table.columns.map(() => "") }] },
      true,
    );

  const addColumn = () =>
    commitTable(
      {
        ...table,
        columns: [...table.columns, { id: nanoid(6), label: `Column ${table.columns.length + 1}` }],
        rows: table.rows.map((row) => ({ ...row, cells: [...row.cells, ""] })),
      },
      true,
    );

  const removeColumn = (columnIndex: number) => {
    if (table.columns.length <= 1) return;
    commitTable(
      {
        ...table,
        columns: table.columns.filter((_, index) => index !== columnIndex),
        rows: table.rows.map((row) => ({
          ...row,
          cells: row.cells.filter((_, index) => index !== columnIndex),
        })),
      },
      true,
    );
  };

  const removeRow = (rowIndex: number) => {
    if (table.rows.length <= 1) return;
    commitTable({ ...table, rows: table.rows.filter((_, index) => index !== rowIndex) }, true);
  };

  const cellValue = (row: TableRow, columnIndex: number) => row.cells[columnIndex] ?? "";

  return (
    <div style={{ width: "100%" }}>
      <ResizeControls id={id} type="table" selected={selected} />
      <motion.div
        data-node-surface
        initial={reduce ? false : { scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 18 }}
        className={`relative w-full overflow-hidden rounded-[8px] border bg-card transition-shadow ${selected ? "border-border-strong shadow-[0_4px_16px_rgba(0,0,0,0.08)]" : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]"}`}
      >
        <Handle type="target" position={Position.Top} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Left} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Right} className="!h-0 !w-0 !opacity-0" />

        <div className="flex items-center justify-between border-b border-border/60 bg-muted/25 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <Table2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={(data.title as string) ?? "Table"}
              onChange={(event) => updateNodeData(id, { title: event.target.value })}
              onBlur={(event) =>
                updateNodeDataWithHistory(id, { title: event.currentTarget.value })
              }
              className="min-w-0 flex-1 bg-transparent text-[13px] font-semibold text-foreground outline-none"
              aria-label="Table title"
            />
          </div>
          <span className="text-[10px] text-muted-foreground">
            {table.rows.length} × {table.columns.length}
          </span>
        </div>

        <div className="max-h-[360px] overflow-auto p-2">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr>
                {table.columns.map((column, columnIndex) => (
                  <th
                    key={column.id}
                    className="min-w-[110px] border border-border/70 bg-muted/30 p-0 text-left font-medium"
                  >
                    <div className="group flex items-center gap-1">
                      <input
                        value={column.label}
                        onChange={(event) =>
                          updateColumn(columnIndex, { label: event.target.value })
                        }
                        onBlur={() => updateNodeDataWithHistory(id, { table })}
                        className="min-w-0 flex-1 bg-transparent px-2 py-1.5 font-medium text-foreground outline-none"
                        aria-label={`${column.label} column name`}
                      />
                      <button
                        type="button"
                        onClick={() => removeColumn(columnIndex)}
                        className="mr-1 rounded p-0.5 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                        aria-label={`Remove ${column.label} column`}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                    </div>
                    <select
                      value={column.kind ?? "text"}
                      onChange={(event) =>
                        updateColumn(columnIndex, {
                          kind: event.target.value as "text" | "number" | "checkbox" | "date",
                        })
                      }
                      className="mx-2 mb-1 w-[calc(100%-16px)] rounded border border-border/60 bg-surface px-1 py-0.5 text-[9px] text-muted-foreground outline-none"
                      aria-label={`${column.label} column type`}
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="date">Date</option>
                    </select>
                  </th>
                ))}
                <th className="w-8 border border-border/70 bg-muted/20">
                  <button
                    type="button"
                    onClick={addColumn}
                    className="p-2 text-muted-foreground hover:text-foreground"
                    aria-label="Add column"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr key={row.id}>
                  {table.columns.map((column, columnIndex) => {
                    const value = cellValue(row, columnIndex);
                    if (column.kind === "checkbox") {
                      return (
                        <td key={column.id} className="border border-border/70 p-2 text-center">
                          <input
                            type="checkbox"
                            checked={value === "true"}
                            onChange={(event) =>
                              updateCell(rowIndex, columnIndex, String(event.target.checked))
                            }
                            aria-label={`${column.label}, row ${rowIndex + 1}`}
                          />
                        </td>
                      );
                    }
                    return (
                      <td key={column.id} className="border border-border/70 p-0">
                        <input
                          type={
                            column.kind === "number"
                              ? "number"
                              : column.kind === "date"
                                ? "date"
                                : "text"
                          }
                          value={value}
                          onChange={(event) =>
                            updateCell(rowIndex, columnIndex, event.target.value)
                          }
                          onBlur={() => updateNodeDataWithHistory(id, { table })}
                          className="w-full bg-transparent px-2 py-2 text-foreground outline-none placeholder:text-muted-foreground/30"
                          aria-label={`${column.label}, row ${rowIndex + 1}`}
                        />
                      </td>
                    );
                  })}
                  <td className="border border-border/70 p-0 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(rowIndex)}
                      className="p-2 text-muted-foreground hover:text-destructive"
                      aria-label={`Remove row ${rowIndex + 1}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-2 border-t border-border/60 bg-muted/20 px-3 py-2">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground hover:bg-surface-hover hover:text-foreground"
          >
            <Plus className="h-3 w-3" /> Row
          </button>
          <p className="text-[10px] text-muted-foreground/60">
            Tab between cells · changes save locally
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default memo(TableNode);
