import { useEffect, useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { Check, Plus, Table2, Trash2 } from "lucide-react";
import { useCanvasStore } from "@/lib/store";
import type { TableColumn, TableData, TableRow } from "@/lib/persistence/types";
import { createDefaultTable, reorderTableRows, updateTableCell } from "@/lib/table";
import type { ItemEditorProps } from "@/lib/item-editor-registry";

const CELL_TYPES: Array<NonNullable<TableColumn["kind"]>> = ["text", "number", "checkbox", "date"];

export function TableEditor({ nodeId, onClose }: ItemEditorProps) {
  const node = useCanvasStore((state) => state.nodes.find((item) => item.id === nodeId));
  const updateNodeData = useCanvasStore((state) => state.updateNodeData);
  const updateNodeDataWithHistory = useCanvasStore((state) => state.updateNodeDataWithHistory);
  const persisted = useMemo(
    () => (node?.data.table as TableData | undefined) ?? createDefaultTable(),
    [node?.data.table],
  );
  const [table, setTable] = useState(persisted);

  useEffect(() => setTable(persisted), [persisted]);

  if (!node) return null;

  const commit = (next: TableData, withHistory = true) => {
    setTable(next);
    if (withHistory) updateNodeDataWithHistory(nodeId, { table: next });
  };

  const updateColumn = (index: number, patch: Partial<TableColumn>) => {
    const next = {
      ...table,
      columns: table.columns.map((column, columnIndex) =>
        columnIndex === index ? { ...column, ...patch } : column,
      ),
    };
    setTable(next);
  };

  const addRow = () =>
    commit({
      ...table,
      rows: [...table.rows, { id: nanoid(6), cells: table.columns.map(() => "") }],
    });

  const addColumn = () =>
    commit({
      ...table,
      columns: [
        ...table.columns,
        { id: nanoid(6), label: `Column ${table.columns.length + 1}`, kind: "text" },
      ],
      rows: table.rows.map((row) => ({ ...row, cells: [...row.cells, ""] })),
    });

  const removeColumn = (index: number) => {
    if (table.columns.length <= 1) return;
    commit({
      ...table,
      columns: table.columns.filter((_, columnIndex) => columnIndex !== index),
      rows: table.rows.map((row) => ({
        ...row,
        cells: row.cells.filter((_, columnIndex) => columnIndex !== index),
      })),
    });
  };

  const removeRow = (index: number) => {
    if (table.rows.length <= 1) return;
    commit({ ...table, rows: table.rows.filter((_, rowIndex) => rowIndex !== index) });
  };

  const setCell = (rowIndex: number, columnIndex: number, value: string) => {
    setTable(updateTableCell(table, rowIndex, columnIndex, value));
  };

  const cellValue = (row: TableRow, index: number) => row.cells[index] ?? "";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-border/70 bg-popover px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Table2 className="h-4 w-4" />
        </div>
        <input
          value={(node.data.title as string) || "Table"}
          onChange={(event) => updateNodeData(nodeId, { title: event.target.value })}
          onBlur={(event) => updateNodeDataWithHistory(nodeId, { title: event.target.value })}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-foreground outline-none"
          aria-label="Table name"
        />
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {table.rows.length} × {table.columns.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-hover"
        >
          Done
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-card p-4">
        <table className="w-full min-w-[620px] border-collapse text-xs">
          <thead>
            <tr>
              {table.columns.map((column, columnIndex) => (
                <th key={column.id} className="border border-border bg-muted/30 p-2 text-left">
                  <div className="flex items-center gap-2">
                    <input
                      value={column.label}
                      onChange={(event) => updateColumn(columnIndex, { label: event.target.value })}
                      onBlur={() => updateNodeDataWithHistory(nodeId, { table })}
                      className="min-w-0 flex-1 bg-transparent font-semibold text-foreground outline-none"
                      aria-label={`${column.label} column name`}
                    />
                    <button
                      type="button"
                      onClick={() => removeColumn(columnIndex)}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove ${column.label} column`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <select
                    value={column.kind ?? "text"}
                    onChange={(event) =>
                      updateColumn(columnIndex, {
                        kind: event.target.value as NonNullable<TableColumn["kind"]>,
                      })
                    }
                    onBlur={() => updateNodeDataWithHistory(nodeId, { table })}
                    className="mt-2 w-full rounded border border-border bg-surface px-1.5 py-1 text-[10px] text-muted-foreground outline-none"
                    aria-label={`${column.label} column type`}
                  >
                    {CELL_TYPES.map((kind) => (
                      <option key={kind} value={kind}>
                        {kind === "checkbox" ? "Checkbox" : kind[0]?.toUpperCase() + kind.slice(1)}
                      </option>
                    ))}
                  </select>
                </th>
              ))}
              <th className="w-12 border border-border bg-muted/20">
                <button
                  type="button"
                  onClick={addColumn}
                  className="rounded p-2 text-muted-foreground hover:text-foreground"
                  aria-label="Add column"
                >
                  <Plus className="h-4 w-4" />
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
                      <td key={column.id} className="border border-border p-2 text-center">
                        <input
                          type="checkbox"
                          checked={value === "true"}
                          onChange={(event) =>
                            commit(
                              updateTableCell(
                                table,
                                rowIndex,
                                columnIndex,
                                String(event.target.checked),
                              ),
                            )
                          }
                          aria-label={`${column.label}, row ${rowIndex + 1}`}
                        />
                      </td>
                    );
                  }
                  return (
                    <td key={column.id} className="border border-border p-0">
                      <input
                        type={
                          column.kind === "number"
                            ? "number"
                            : column.kind === "date"
                              ? "date"
                              : "text"
                        }
                        value={value}
                        onChange={(event) => setCell(rowIndex, columnIndex, event.target.value)}
                        onBlur={() => updateNodeDataWithHistory(nodeId, { table })}
                        className="w-full bg-transparent px-2.5 py-2.5 text-foreground outline-none focus:bg-muted/20"
                        aria-label={`${column.label}, row ${rowIndex + 1}`}
                      />
                    </td>
                  );
                })}
                <td className="border border-border p-1 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => commit(reorderTableRows(table, rowIndex, -1))}
                      aria-label={`Move row ${rowIndex + 1} up`}
                      className="rounded px-1 text-muted-foreground hover:bg-surface-hover"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => commit(reorderTableRows(table, rowIndex, 1))}
                      aria-label={`Move row ${rowIndex + 1} down`}
                      className="rounded px-1 text-muted-foreground hover:bg-surface-hover"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRow(rowIndex)}
                      aria-label={`Remove row ${rowIndex + 1}`}
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
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

      <div className="flex shrink-0 items-center gap-2 border-t border-border/70 bg-popover px-4 py-3">
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> Row
        </button>
        <button
          type="button"
          onClick={addColumn}
          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> Column
        </button>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground/70">
          <Check className="h-3 w-3 text-emerald-500" /> Saved locally
        </span>
      </div>
    </div>
  );
}

export default TableEditor;
