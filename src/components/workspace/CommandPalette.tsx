import { CheckSquare, Image, StickyNote, Type, Upload } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const actions = [
  { label: "Add Text", icon: Type },
  { label: "Add Image", icon: Image },
  { label: "Add To-do", icon: CheckSquare },
  { label: "Add Sticky Note", icon: StickyNote },
];

const board = [{ label: "Export board", icon: Upload }];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Search actions"
      className="rounded-xl border-border"
    >
      <CommandInput placeholder="Search actions..." />
      <CommandList className="p-1">
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Insert">
          {actions.map(({ label, icon: Icon }) => (
            <CommandItem key={label} className="gap-2.5 rounded-lg px-3 py-2.5">
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Board">
          {board.map(({ label, icon: Icon }) => (
            <CommandItem key={label} className="gap-2.5 rounded-lg px-3 py-2.5">
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
