import { useCallback, useState, useMemo, useRef, useEffect } from "react";
import { Download } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCanvasStore } from "@/lib/store";
import { useNoticeStore } from "@/lib/notice-store";
import { ITEM_REGISTRY } from "@/lib/item-registry";
import { executeCanvasItem } from "@/lib/canvas-executor";

type Action = {
  label: string;
  icon: LucideIcon;
  action: () => void;
};

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const execute = useCallback(
    (type: string) => {
      if (executeCanvasItem(type)) onOpenChange(false);
    },
    [onOpenChange],
  );

  const exportBoard = useCallback(() => {
    const { nodes, edges } = useCanvasStore.getState();
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sutonote-board.json";
    a.click();
    URL.revokeObjectURL(url);
    onOpenChange(false);
    useNoticeStore.getState().show("Board exported", "success");
  }, [onOpenChange]);

  const allActions: Action[] = useMemo(() => {
    const itemActions = ITEM_REGISTRY.filter((item) => item.status !== "coming-soon").map(
      (item) => ({
        label:
          item.kind === "node"
            ? `Add ${item.label}`
            : item.type === "pen"
              ? "Pen Tool"
              : item.label,
        icon: item.icon,
        action: () => execute(item.type),
      }),
    );
    return [...itemActions, { label: "Export board", icon: Download, action: exportBoard }];
  }, [execute, exportBoard]);

  const filteredActions = useMemo(
    () => allActions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase())),
    [allActions, query],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        ref={inputRef}
        placeholder="Search actions..."
        // @ts-expect-error - cmdk types incomplete, onChange passed to primitive
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
      />
      <CommandList className="p-1">
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Insert">
          {filteredActions
            .filter((a) => a.label.startsWith("Add"))
            .map((action) => (
              <CommandItem
                key={action.label}
                onSelect={action.action}
                className="gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer"
              >
                <action.icon className="h-4 w-4 text-muted-foreground" />
                {action.label}
              </CommandItem>
            ))}
        </CommandGroup>
        <CommandGroup heading="Board">
          {filteredActions
            .filter((a) => !a.label.startsWith("Add"))
            .map((action) => (
              <CommandItem
                key={action.label}
                onSelect={action.action}
                className="gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer"
              >
                <action.icon className="h-4 w-4 text-muted-foreground" />
                {action.label}
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
