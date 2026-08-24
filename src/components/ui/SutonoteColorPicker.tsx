import * as React from "react";
import { useState, useEffect } from "react";
import { Check, Pipette } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ColorPalette = "object" | "text" | "highlight";

export interface ColorOption {
  name: string;
  value: string; // hex or css var
  display: string; // css for swatch
}

const OBJECT_PALETTE: ColorOption[] = [
  { name: "Neutral", value: "transparent", display: "var(--card)" },
  { name: "Sand", value: "var(--sut-highlight-sand)", display: "var(--sut-highlight-sand)" },
  { name: "Clay", value: "#a0522d", display: "#a0522d" },
  { name: "Rose", value: "#be123c", display: "#be123c" },
  { name: "Sage", value: "#15803d", display: "#15803d" },
  { name: "Sky", value: "#0284c7", display: "#0284c7" },
  { name: "Lavender", value: "#7c3aed", display: "#7c3aed" },
];

const TEXT_PALETTE: ColorOption[] = [
  { name: "Default", value: "", display: "linear-gradient(90deg, #0f172a, #7c3aed)" },
  { name: "Muted", value: "#6b7280", display: "#6b7280" },
  { name: "Clay", value: "#78350f", display: "#78350f" },
  { name: "Rose", value: "#be123c", display: "#be123c" },
  { name: "Sage", value: "#15803d", display: "#15803d" },
  { name: "Sky", value: "#0284c7", display: "#0284c7" },
  { name: "Lavender", value: "#7c3aed", display: "#7c3aed" },
];

const HIGHLIGHT_PALETTE: ColorOption[] = [
  { name: "Sand", value: "var(--sut-highlight-sand)", display: "var(--sut-highlight-sand)" },
  { name: "Apricot", value: "var(--sut-highlight-apricot)", display: "var(--sut-highlight-apricot)" },
  { name: "Rose", value: "var(--sut-highlight-rose)", display: "var(--sut-highlight-rose)" },
  { name: "Sage", value: "var(--sut-highlight-sage)", display: "var(--sut-highlight-sage)" },
  { name: "Sky", value: "var(--sut-highlight-sky)", display: "var(--sut-highlight-sky)" },
  { name: "Lavender", value: "var(--sut-highlight-lavender)", display: "var(--sut-highlight-lavender)" },
];

const PALETTES: Record<ColorPalette, ColorOption[]> = {
  object: OBJECT_PALETTE,
  text: TEXT_PALETTE,
  highlight: HIGHLIGHT_PALETTE,
};

function getRecentColors(): string[] {
  try {
    const raw = localStorage.getItem("sutonote:recent-colors");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function pushRecentColor(color: string) {
  if (!color || color.startsWith("var(")) return;
  try {
    const recent = getRecentColors().filter((c) => c !== color);
    recent.unshift(color);
    localStorage.setItem("sutonote:recent-colors", JSON.stringify(recent.slice(0, 8)));
  } catch {}
}

interface SutonoteColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  palette?: ColorPalette;
  allowCustom?: boolean;
  triggerClassName?: string;
  align?: "center" | "start" | "end";
}

export function SutonoteColorPicker({
  value,
  onChange,
  palette = "object",
  allowCustom = true,
  triggerClassName,
  align = "start",
}: SutonoteColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(value.startsWith("#") ? value : "#6366f1");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (open) setRecent(getRecentColors());
  }, [open]);

  useEffect(() => {
    if (value.startsWith("#")) setHex(value);
  }, [value]);

  const options = PALETTES[palette] ?? OBJECT_PALETTE;

  const handleSelect = (color: string) => {
    onChange(color);
    if (color.startsWith("#")) pushRecentColor(color);
    setOpen(false);
  };

  const handleCustomChange = (newHex: string) => {
    setHex(newHex);
    if (/^#[0-9a-f]{6}$/i.test(newHex)) {
      onChange(newHex);
      pushRecentColor(newHex);
    }
  };

  const handleHexInput = (raw: string) => {
    const v = "#" + raw.replace(/[^0-9a-f]/gi, "").slice(0, 6);
    setHex(v);
    if (/^#[0-9a-f]{6}$/i.test(v)) {
      onChange(v);
      pushRecentColor(v);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-[5px] border border-border shadow-sm transition-colors hover:scale-105",
            triggerClassName,
          )}
          style={{ background: value || "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)" }}
          aria-label="Pick color"
        >
          {!value && <Pipette className="h-3 w-3 text-white drop-shadow" />}
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-[220px] p-3">
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Palette</p>
            <div className="grid grid-cols-7 gap-1.5">
              {options.map((opt) => (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  title={opt.name}
                  className={cn(
                    "h-7 w-7 rounded-[5px] border border-border transition-all hover:scale-105",
                    value === opt.value && "ring-2 ring-primary ring-offset-1",
                  )}
                  style={{ background: opt.display }}
                >
                  {value === opt.value && (
                    <Check className="h-3 w-3 mx-auto text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {recent.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Recent</p>
              <div className="flex gap-1.5 flex-wrap">
                {recent.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSelect(c)}
                    title={c}
                    className={cn(
                      "h-6 w-6 rounded-[5px] border border-border transition-all hover:scale-105",
                      value === c && "ring-2 ring-primary ring-offset-1",
                    )}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {allowCustom && (
            <div>
              <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Custom</p>
              <div className="flex gap-2">
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-[5px] border border-border">
                  <input
                    type="color"
                    value={hex}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    className="absolute inset-0 h-[150%] w-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer border-0 p-0"
                  />
                </div>
                <div className="flex flex-1 items-center gap-1 rounded-[5px] border border-border bg-surface px-2">
                  <span className="text-[12px] text-muted-foreground">#</span>
                  <input
                    value={hex.replace("#", "")}
                    onChange={(e) => handleHexInput(e.target.value)}
                    className="flex-1 bg-transparent text-[12px] font-mono text-foreground outline-none"
                    maxLength={6}
                    placeholder="6366f1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Convenience wrappers for specific palettes
export function ObjectColorPicker(props: Omit<SutonoteColorPickerProps, "palette">) {
  return <SutonoteColorPicker {...props} palette="object" />;
}
export function TextColorPicker(props: Omit<SutonoteColorPickerProps, "palette">) {
  return <SutonoteColorPicker {...props} palette="text" />;
}
export function HighlightPicker(props: Omit<SutonoteColorPickerProps, "palette">) {
  return <SutonoteColorPicker {...props} palette="highlight" />;
}
