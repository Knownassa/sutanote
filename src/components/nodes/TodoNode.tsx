import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, useReducedMotion } from "motion/react";
import { useCanvasStore } from "@/lib/store";
import { CheckCircle2, Circle } from "lucide-react";

interface Todo {
  label: string;
  done: boolean;
}

function TodoNode({ id, data, selected }: NodeProps) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const reduce = useReducedMotion();
  const rotation = (data.rotation as number) ?? 0;

  const todos: Todo[] = Array.isArray(data.todos)
    ? (data.todos as Todo[])
    : [
        { label: "Task 1", done: false },
        { label: "Task 2", done: false },
        { label: "Task 3", done: false },
      ];

  const setTodos = (next: Todo[]) => updateNodeData(id, { todos: next });
  const toggle = (i: number) =>
    setTodos(todos.map((t, idx) => (idx === i ? { ...t, done: !t.done } : t)));
  const remove = (i: number) => setTodos(todos.filter((_, idx) => idx !== i));
  const add = (label: string) => setTodos([...todos, { label, done: false }]);

  return (
    <div style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "center" }}>
      <motion.div
        initial={reduce ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: selected ? 1.02 : 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 15 }}
        className={`relative select-none rounded-xl border p-5 transition-[box-shadow,border-color] ${
          data.color ?? "bg-card"
        } ${selected ? "border-border-strong shadow-[0_8px_30px_rgba(0,0,0,0.08)]" : "border-border hover:shadow-md"}`}
        style={{ minWidth: 260, maxWidth: 400 }}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="h-3 w-3 bg-transparent opacity-0"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="h-3 w-3 bg-transparent opacity-0"
        />
        <Handle
          type="source"
          position={Position.Left}
          className="h-3 w-3 bg-transparent opacity-0"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="h-3 w-3 bg-transparent opacity-0"
        />

        <div className="space-y-2">
          {todos.map((todo, i) => (
            <div
              key={i}
              className={`flex items-center gap-2.5 text-sm transition-all ${
                todo.done ? "scale-[0.98] opacity-60" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border transition-colors hover:border-primary"
              >
                {todo.done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                ) : (
                  <div className="h-3.5 w-3.5 rounded border border-border" />
                )}
              </button>
              <span
                className={`flex-1 truncate ${todo.done ? "text-muted-foreground line-through" : "text-foreground"}`}
              >
                {todo.label}
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 opacity-0 transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                aria-label="Remove task"
              >
                <svg
                  className="h-3 w-3"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <line
                    x1="18"
                    y1="6"
                    x2="6"
                    y2="18"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="6"
                    y1="6"
                    x2="18"
                    y2="18"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))}

          <form
            className="mt-2 flex items-center gap-2 border-t border-border pt-2"
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem("task") as HTMLInputElement;
              if (input.value.trim()) {
                add(input.value.trim());
                input.value = "";
              }
            }}
          >
            <input
              name="task"
              type="text"
              placeholder="Add task..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-0"
            />
            <button
              type="submit"
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
              aria-label="Add task"
            >
              <svg
                className="h-3.5 w-3.5"
                strokeWidth={2}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default memo(TodoNode);
