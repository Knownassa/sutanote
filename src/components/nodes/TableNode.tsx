import { memo, useEffect, useMemo, useState } from "react";
import { NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { nanoid } from "nanoid";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Minus,
  Plus,
  Table2,
  Trash2,
} from "lucide-react";
import { useCanvasStore } from "@/lib/store";
import type { TableColumn, TableData, TableRow } from "@/lib/persistence/types";
import {
  createDefaultTable,
  reorderTableColumns,
  reorderTableRows,
  updateTableCell,
} from "@/lib/table";
import { ResizeControls } from "./ResizeControls";
import { ConnectorPorts } from "./ConnectorPorts";
import { useItemEditorStore } from "@/lib/item-editor-store";

function TableNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((s) => s.updateNodeDataWithHistory);
  const reduce = useReducedMotion();
  const persistedTable = useMemo(
    () => (data.table as TableData | undefined) ?? createDefaultTable(),
    [data.table],
  );
  const [draftTable, setDraftTable] = useState(persistedTable);

  useEffect(() => setDraftTable(persistedTable), [persistedTable]);

  const table = draftTable;

  const commitTable = (next: TableData, withHistory = false) => {
    setDraftTable(next);
    if (withHistory) updateNodeDataWithHistory(id, { table: next });
  };

  const updateCell = (rowIndex: number, columnIndex: number, value: string) => {
    setDraftTable(updateTableCell(table, rowIndex, columnIndex, value));
  };

  const updateColumn = (columnIndex: number, patch: Partial<TableColumn>) => {
    const columns = table.columns.map((column, index) =>
      index === columnIndex ? { ...column, ...patch } : column,
    );
    setDraftTable({ ...table, columns });
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

  const moveRow = (rowIndex: number, direction: -1 | 1) => {
    commitTable(reorderTableRows(table, rowIndex, direction), true);
  };

  const moveColumn = (columnIndex: number, direction: -1 | 1) => {
    commitTable(reorderTableColumns(table, columnIndex, direction), true);
  };

  const pasteCells = (rowIndex: number, columnIndex: number, raw: string) => {
    const pasted = raw
      .trimEnd()
      .split(/\r?\n/)
      .map((row) => row.split("\t"));
    const rows = table.rows.map((row) => ({ ...row, cells: [...row.cells] }));
    pasted.forEach((values, pastedRow) => {
      const targetRow = rows[rowIndex + pastedRow];
      if (!targetRow) return;
      values.forEach((value, pastedColumn) => {
        const targetColumn = columnIndex + pastedColumn;
        if (targetColumn < table.columns.length) targetRow.cells[targetColumn] = value;
      });
    });
    commitTable({ ...table, rows }, true);
  };

  const handleCellKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" || event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
      return;
    }
    if (event.key !== "Tab") return;
    event.preventDefault();
    const cells = Array.from(
      event.currentTarget
        .closest("[data-table-node]")
        ?.querySelectorAll<HTMLInputElement>("[data-table-cell]") ?? [],
    );
    const next = cells[cells.indexOf(event.currentTarget) + (event.shiftKey ? -1 : 1)];
    next?.focus();
  };

  const cellValue = (row: TableRow, columnIndex: number) => row.cells[columnIndex] ?? "";

  return (
    <div style={{ width: "100%" }}>
      <ResizeControls id={id} type="table" selected={selected} />
      <motion.div
        data-table-node
        data-node-surface
        initial={reduce ? false : { scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 18 }}
        className={`nodrag nowheel relative w-full overflow-hidden rounded-[8px] border bg-card transition-shadow ${selected ? "border-border-strong shadow-[0_4px_16px_rgba(0,0,0,0.08)]" : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]"}`}
        onDoubleClick={(event) => {
          event.stopPropagation();
          useItemEditorStore.getState().open(id, "table", "window");
        }}
      >
        <ConnectorPorts />

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
                    style={{ width: column.width ?? 140 }}
                  >
                    <div className="group flex items-center gap-1">
                      <input
                        data-table-column
                        value={column.label}
                        onChange={(event) =>
                          updateColumn(columnIndex, { label: event.target.value })
                        }
                        onBlur={() => updateNodeDataWithHistory(id, { table })}
                        className="nodrag nowheel select-text min-w-0 flex-1 bg-transparent px-2 py-1.5 font-medium text-foreground outline-none"
                        aria-label={`${column.label} column name`}
                      />
                      <button
                        type="button"
                        onClick={() => removeColumn(columnIndex)}
                        className="nodrag mr-1 rounded p-0.5 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
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
                      onBlur={() => updateNodeDataWithHistory(id, { table })}
                      className="nodrag nowheel mx-2 mb-1 w-[calc(100%-16px)] rounded border border-border/60 bg-surface px-1 py-0.5 text-[9px] text-muted-foreground outline-none"
                      aria-label={`${column.label} column type`}
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="date">Date</option>
                    </select>
                    <input
                      type="range"
                      min={90}
                      max={320}
                      value={column.width ?? 140}
                      onChange={(event) =>
                        updateColumn(columnIndex, { width: Number(event.target.value) })
                      }
                      onMouseUp={() => updateNodeDataWithHistory(id, { table })}
                      className="nodrag nowheel mx-2 mb-1 h-1 w-[calc(100%-16px)] accent-primary"
                      aria-label={`${column.label} column width`}
                    />
                    <div className="flex items-center justify-center gap-1 pb-1">
                      <button
                        type="button"
                        onClick={() => moveColumn(columnIndex, -1)}
                        className="nodrag rounded p-0.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                        aria-label={`Move ${column.label} left`}
                      >
                        <ArrowLeft className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveColumn(columnIndex, 1)}
                        className="nodrag rounded p-0.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                        aria-label={`Move ${column.label} right`}
                      >
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </th>
                ))}
                <th className="w-8 border border-border/70 bg-muted/20">
                  <button
                    type="button"
                    onClick={addColumn}
                    className="nodrag p-2 text-muted-foreground hover:text-foreground"
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
                            className="nodrag nowheel"
                            data-table-cell
                            type="checkbox"
                            checked={value === "true"}
                            onChange={(event) =>
                              commitTable(
                                updateTableCell(
                                  table,
                                  rowIndex,
                                  columnIndex,
                                  String(event.target.checked),
                                ),
                                true,
                              )
                            }
                            onKeyDown={handleCellKeyDown}
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
                          onKeyDown={handleCellKeyDown}
                          onCopy={(event) => {
                            event.preventDefault();
                            event.clipboardData.setData("text/plain", value);
                          }}
                          onPaste={(event) => {
                            event.preventDefault();
                            pasteCells(rowIndex, columnIndex, event.clipboardData.getData("text"));
                          }}
                          data-table-cell
                          aria-label={`${column.label}, row ${rowIndex + 1}`}
                        />
                      </td>
                    );
                  })}
                  <td className="border border-border/70 p-0 text-center">
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => moveRow(rowIndex, -1)}
                        className="nodrag p-1 text-muted-foreground hover:text-foreground"
                        aria-label={`Move row ${rowIndex + 1} up`}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRow(rowIndex, 1)}
                        className="nodrag p-1 text-muted-foreground hover:text-foreground"
                        aria-label={`Move row ${rowIndex + 1} down`}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRow(rowIndex)}
                        className="nodrag p-2 text-muted-foreground hover:text-destructive"
                        aria-label={`Remove row ${rowIndex + 1}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
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
