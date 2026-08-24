import { useCallback, useState, useMemo, useRef, useEffect } from "react";
import type { ReactElement } from "react";
import { CheckSquare, Image, StickyNote, Type, Download } from "lucide-react";
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

type Action = {
  label: string;
  icon: typeof Type;
  action: () => void;
};

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const addNode = useCanvasStore((s) => s.addNode);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const insert = useCallback(
    (type: string) => {
      const nodes = useCanvasStore.getState().nodes;
      const maxX = nodes.reduce((m, n) => Math.max(m, n.position.x), 0);
      addNode(type, { x: maxX + 300, y: 0 });
      onOpenChange(false);
    },
    [addNode, onOpenChange],
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

  const allActions: Action[] = useMemo(
    () => [
      { label: "Add Text", icon: Type, action: () => insert("text") },
      { label: "Add Image", icon: Image, action: () => insert("image") },
      { label: "Add To-do", icon: CheckSquare, action: () => insert("todo") },
      { label: "Add Sticky Note", icon: StickyNote, action: () => insert("sticky") },
      { label: "Export board", icon: Download, action: exportBoard },
    ],
    [insert, exportBoard],
  );

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
