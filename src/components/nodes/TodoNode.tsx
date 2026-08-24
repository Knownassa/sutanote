import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { useInteractionStore } from "@/lib/interaction-store";
import { Plus } from "lucide-react";
import { ResizeControls } from "./ResizeControls";

interface Todo {
  label: string;
  done: boolean;
}

function TodoNode(props: NodeProps) {
  const { id, data, selected } = props;
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;

  const showCompleted = (data.showCompleted as boolean) ?? true;
  const allTodos: Todo[] = Array.isArray(data.todos)
    ? (data.todos as Todo[])
    : [
        { label: "Task 1", done: false },
        { label: "Task 2", done: false },
        { label: "Task 3", done: false },
      ];
  const todos = allTodos.filter((t) => showCompleted || !t.done);
  const doneCount = allTodos.filter((t) => t.done).length;
  const totalCount = allTodos.length;
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  const setTodos = (next: Todo[]) => updateNodeData(id, { todos: next });
  const toggle = (i: number) =>
    setTodos(todos.map((t, idx) => (idx === i ? { ...t, done: !t.done } : t)));
  const add = (label: string) => setTodos([...todos, { label, done: false }]);

  return (
    <div
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center",
        width: "100%",
      }}
    >
      <ResizeControls {...props} />
      <motion.div
        data-node-surface
        initial={reduce ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 15 }}
        className={`relative w-full select-none rounded-xl border transition-shadow ${
          (data.backgroundColor as string) || (data.color ?? "bg-card")
        } ${
          selected
            ? "border-border-strong shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
            : "border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-border-strong hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
        }`}
        style={{ padding: "18px 20px" }}
      >
        <Handle type="target" position={Position.Top} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Left} className="!h-0 !w-0 !opacity-0" />
        <Handle type="source" position={Position.Right} className="!h-0 !w-0 !opacity-0" />

        <input
          value={(data.title as string) ?? "To-do"}
          onChange={(e) => updateNodeData(id, { title: e.target.value })}
          onFocus={() => useInteractionStore.getState().setEditingText(true)}
          onBlur={() => useInteractionStore.getState().setEditingText(false)}
          className="mb-3 w-full cursor-text bg-transparent text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/80 outline-none focus:ring-0"
        />

        {totalCount > 0 && (
          <div className="mb-3 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-border/60">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-muted-foreground/70">
              {doneCount}/{totalCount}
            </span>
          </div>
        )}

        <div className="space-y-2">
          {todos.map((todo, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 text-[13px] transition-all ${
                todo.done ? "scale-[0.98] opacity-50" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                  todo.done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/60"
                }`}
                aria-label={todo.done ? "Mark incomplete" : "Mark complete"}
              >
                {todo.done && (
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
              <span
                className={`flex-1 truncate ${
                  todo.done ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {todo.label}
              </span>
            </div>
          ))}
        </div>

        <form
          className="mt-3 flex items-center gap-2 border-t border-border/60 pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem("task") as HTMLInputElement;
            if (input.value.trim()) {
              add(input.value.trim());
              input.value = "";
            }
          }}
        >
          <Plus className="h-3.5 w-3.5 text-muted-foreground/50" />
          <input
            name="task"
            type="text"
            placeholder="Add a task"
            onFocus={() => useInteractionStore.getState().setEditingText(true)}
            onBlur={() => useInteractionStore.getState().setEditingText(false)}
            className="flex-1 cursor-text bg-transparent text-[13px] text-foreground outline-none focus:ring-0 placeholder:text-muted-foreground/50"
          />
        </form>
      </motion.div>
    </div>
  );
}

export default memo(TodoNode);
