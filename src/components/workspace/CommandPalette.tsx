import { useCallback } from "react";
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

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const addNode = useCanvasStore((s) => s.addNode);

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

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search actions..." />
      <CommandList className="p-1">
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Insert">
          <CommandItem
            onSelect={() => insert("text")}
            className="gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer"
          >
            <Type className="h-4 w-4 text-muted-foreground" />
            Add Text
          </CommandItem>
          <CommandItem
            onSelect={() => insert("image")}
            className="gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer"
          >
            <Image className="h-4 w-4 text-muted-foreground" />
            Add Image
          </CommandItem>
          <CommandItem
            onSelect={() => insert("todo")}
            className="gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer"
          >
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
            Add To-do
          </CommandItem>
          <CommandItem
            onSelect={() => insert("sticky")}
            className="gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer"
          >
            <StickyNote className="h-4 w-4 text-muted-foreground" />
            Add Sticky Note
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Board">
          <CommandItem
            onSelect={exportBoard}
            className="gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer"
          >
            <Download className="h-4 w-4 text-muted-foreground" />
            Export board
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
