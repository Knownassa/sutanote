import { CheckCircle2, Circle } from "lucide-react";

const cardBase =
  "absolute select-none border border-border bg-card transition-[box-shadow,border-color] duration-200 hover:border-border-strong hover:shadow-md";

export function TextCard() {
  return (
    <article
      className={`${cardBase} left-[8%] top-[14%] w-72 rounded-xl p-5`}
      style={{ transform: "rotate(-0.4deg)" }}
    >
      <h3 className="font-serif text-base font-medium">Direction & tone</h3>
      <p className="mt-2 font-serif text-sm leading-relaxed text-muted-foreground">
        Quiet surfaces, crisp edges, warm paper tones. Everything earns its place on the canvas.
      </p>
    </article>
  );
}

export function StickyNote() {
  return (
    <article
      className={`absolute left-[42%] top-[9%] w-56 select-none rounded-lg border border-note-foreground/10 bg-note-yellow p-4 text-note-foreground transition-[box-shadow,border-color] duration-200 hover:border-note-foreground/25 hover:shadow-md`}
      style={{ transform: "rotate(1.2deg)" }}
    >
      <p className="font-serif text-sm leading-relaxed">
        Ask the studio for the archive photos before Thursday.
      </p>
      <p className="mt-3 text-[11px] uppercase tracking-wide opacity-60">Note</p>
    </article>
  );
}

const todos = [
  { label: "Collect reference boards", done: true },
  { label: "Pick two type pairings", done: true },
  { label: "Draft canvas grid spec", done: false },
];

export function TodoCard() {
  return (
    <article
      className={`${cardBase} left-[24%] top-[46%] w-80 rounded-xl p-5`}
      style={{ transform: "rotate(0.3deg)" }}
    >
      <h3 className="text-sm font-medium">This week</h3>
      <ul className="mt-3 space-y-2.5">
        {todos.map((todo) => (
          <li key={todo.label} className="flex items-center gap-2.5 text-sm">
            {todo.done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-muted-foreground/60" strokeWidth={1.5} />
            )}
            <span className={todo.done ? "text-muted-foreground line-through" : "text-foreground"}>
              {todo.label}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
