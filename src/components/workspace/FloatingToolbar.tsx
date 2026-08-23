import {
  AlignHorizontalSpaceAround,
  AlignStartHorizontal,
  AlignStartVertical,
  Trash2,
} from "lucide-react";

const swatches = ["bg-note-yellow", "bg-note-rose", "bg-note-sage", "bg-note-lavender"];

export function FloatingToolbar() {
  return (
    <div className="pointer-events-auto absolute left-1/2 top-5 z-20 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-border bg-popover p-1 shadow-sm">
      {[
        { icon: AlignStartVertical, label: "Align left" },
        { icon: AlignStartHorizontal, label: "Align top" },
        { icon: AlignHorizontalSpaceAround, label: "Distribute horizontally" },
      ].map(({ icon: Icon, label }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}

      <span className="mx-1 h-5 w-px bg-border" />

      <div className="flex items-center gap-1 px-1">
        {swatches.map((swatch) => (
          <button
            key={swatch}
            type="button"
            aria-label="Set color"
            className={`h-4 w-4 rounded-[5px] border border-foreground/10 ${swatch} transition-transform hover:scale-110`}
          />
        ))}
      </div>

      <span className="mx-1 h-5 w-px bg-border" />

      <button
        type="button"
        aria-label="Delete"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
