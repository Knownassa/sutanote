import { motion } from "motion/react";
import {
  AlignCenterHorizontal,
  AlignHorizontalSpaceAround,
  AlignStartVertical,
  AlignEndVertical,
  BringToFront,
  SendToBack,
} from "lucide-react";

const swatches = [
  { name: "Muted yellow", className: "bg-note-yellow" },
  { name: "Dusty rose", className: "bg-note-rose" },
  { name: "Soft blue", className: "bg-note-blue" },
  { name: "Sage green", className: "bg-note-sage" },
  { name: "Paper white", className: "bg-card" },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
      {children}
    </p>
  );
}

function ToolButton({
  label,
  icon: Icon,
  wide,
}: {
  label: string;
  icon: typeof BringToFront;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`flex h-8 items-center justify-center gap-2 rounded-lg border border-border text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground ${
        wide ? "flex-1 px-2 text-xs" : "w-full"
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      {wide && <span className="truncate">{label}</span>}
    </button>
  );
}

export function PropertiesPanel() {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto absolute right-6 top-6 z-20 w-[240px] rounded-2xl border border-border bg-popover/90 p-4 shadow-lg backdrop-blur-md"
    >
      <p className="text-xs font-medium text-muted-foreground">Properties</p>

      <div className="mt-4 space-y-5">
        <div>
          <SectionLabel>Arrange</SectionLabel>
          <div className="flex gap-1.5">
            <ToolButton label="Bring to front" icon={BringToFront} wide />
            <ToolButton label="Send to back" icon={SendToBack} wide />
          </div>
        </div>

        <div>
          <SectionLabel>Align</SectionLabel>
          <div className="grid grid-cols-4 gap-1.5">
            <ToolButton label="Align left" icon={AlignStartVertical} />
            <ToolButton label="Align center" icon={AlignCenterHorizontal} />
            <ToolButton label="Align right" icon={AlignEndVertical} />
            <ToolButton label="Distribute" icon={AlignHorizontalSpaceAround} />
          </div>
        </div>

        <div>
          <SectionLabel>Style</SectionLabel>
          <div className="flex items-center gap-2">
            {swatches.map((swatch) => (
              <button
                key={swatch.name}
                type="button"
                aria-label={swatch.name}
                title={swatch.name}
                className={`h-6 w-6 rounded-lg border border-border-strong transition-transform hover:scale-110 ${swatch.className}`}
              />
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Size</SectionLabel>
          <div className="flex gap-2">
            {[
              { label: "W", value: 288 },
              { label: "H", value: 164 },
            ].map((field) => (
              <label
                key={field.label}
                className="flex flex-1 items-center gap-2 rounded-lg border border-border px-2.5 py-1.5"
              >
                <span className="text-xs text-muted-foreground">{field.label}</span>
                <input
                  type="number"
                  defaultValue={field.value}
                  className="w-full bg-transparent text-xs text-foreground outline-none"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
