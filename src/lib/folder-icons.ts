import {
  Folder,
  FolderOpen,
  Star,
  Heart,
  Briefcase,
  Palette,
  ImageIcon,
  Camera,
  Music,
  Code,
  Bookmark,
  Rocket,
  Lightbulb,
  BookOpen,
  Archive,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Icon choices for folder items. `id` is what gets persisted in node data. */
export const FOLDER_ICONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "folder", label: "Folder", icon: Folder },
  { id: "folder-open", label: "Open folder", icon: FolderOpen },
  { id: "star", label: "Star", icon: Star },
  { id: "heart", label: "Heart", icon: Heart },
  { id: "briefcase", label: "Work", icon: Briefcase },
  { id: "palette", label: "Design", icon: Palette },
  { id: "image", label: "Images", icon: ImageIcon },
  { id: "camera", label: "Photos", icon: Camera },
  { id: "music", label: "Music", icon: Music },
  { id: "code", label: "Code", icon: Code },
  { id: "bookmark", label: "Bookmark", icon: Bookmark },
  { id: "rocket", label: "Launch", icon: Rocket },
  { id: "lightbulb", label: "Ideas", icon: Lightbulb },
  { id: "book", label: "Reading", icon: BookOpen },
  { id: "archive", label: "Archive", icon: Archive },
  { id: "users", label: "Team", icon: Users },
];

export const DEFAULT_FOLDER_ICON = "folder";

export function getFolderIcon(id?: string): LucideIcon {
  return (FOLDER_ICONS.find((i) => i.id === id) ?? FOLDER_ICONS[0]!).icon;
}
