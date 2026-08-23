import { CheckSquare, Image, MousePointer2, Square, Type, ArrowRight } from "lucide-react";
import { useState } from "react";

const groups = [
  [{ icon: MousePointer2, label: "Select" }],
  [
    { icon: Type, label: "Text" },
    { icon: Square, label: "Sticky note" },
    { icon: CheckSquare, label: "To-do list" },
  ],
  [
    { icon: Image, label: "Image" },
    { icon: ArrowRight, label: "Connector" },
  ],
];

export function BottomToolbar() {
  const [active, setActive] = useState("Select");

  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border border-border bg-popover/85 p-2 shadow-lg backdrop-blur-md">
      {groups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-1.5">
          {gi > 0 && <span className="mx-1 h-6 w-px bg-border" />}
          {group.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              title={label}
              onClick={() => setActive(label)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                active === label
                  ? "bg-surface-active text-foreground"
                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
