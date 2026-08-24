"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";

interface RichTextEditorProps {
  id: string;
  content: string;
  onChange: (content: string) => void;
  onBlur: () => void;
  placeholder?: string;
  editable?: boolean;
  fontSize?: number;
  textAlign?: "left" | "center" | "right";
  textColor?: string;
  bold?: boolean;
  italic?: boolean;
  highlightColor?: string;
}

export function RichTextEditor({
  id,
  content,
  onChange,
  onBlur,
  placeholder = "Start writing...",
  editable = true,
  fontSize = 14,
  textAlign = "left",
  textColor = "",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, codeBlock: false }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: () => placeholder,
        emptyEditorClass: "is-editor-empty",
        emptyNodeClass: "is-empty",
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: content || "",
    editable,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onBlur: () => onBlur(),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[80px]",
      },
    },
  });

  const [bubblePos, setBubblePos] = useState<{ x: number; y: number } | null>(null);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    if (!editor) return;
    const updateBubble = () => {
      const { from, to, empty } = editor.state.selection;
      const isFocused = editor.isFocused;
      if (empty || !isFocused || from === to) {
        setShowBubble(false);
        return;
      }
      // Only show if selection belongs to this editor
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        setShowBubble(false);
        return;
      }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (!rect || (rect.width === 0 && rect.height === 0)) {
        setShowBubble(false);
        return;
      }
      // Check selection is inside editor DOM
      const editorEl = document.querySelector(`[data-rich-id="${id}"]`);
      if (editorEl && !editorEl.contains(range.commonAncestorContainer)) {
        // fallback: check if range is inside editor view
      }
      const x = rect.left + rect.width / 2;
      let y = rect.top;
      // flip below if not enough space above
      if (y < 60) y = rect.bottom + 12;
      // keep inside viewport
      const clampedX = Math.max(120, Math.min(window.innerWidth - 120, x));
      setBubblePos({ x: clampedX, y });
      setShowBubble(true);
    };
    editor.on("selectionUpdate", updateBubble);
    editor.on("transaction", updateBubble);
    const onBlurHide = () => setShowBubble(false);
    editor.on("blur", onBlurHide);
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowBubble(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => {
      editor.off("selectionUpdate", updateBubble);
      editor.off("transaction", updateBubble);
      editor.off("blur", onBlurHide);
      window.removeEventListener("keydown", onEsc);
    };
  }, [editor, id]);

  useEffect(() => {
    if (!editor) return;
    if (!editable) setShowBubble(false);
  }, [editable, editor]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!editor) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "b") {
        e.preventDefault();
        editor.chain().focus().toggleBold().run();
      } else if (mod && e.key === "i") {
        e.preventDefault();
        editor.chain().focus().toggleItalic().run();
      } else if (mod && e.key === "u") {
        e.preventDefault();
        editor.chain().focus().toggleUnderline().run();
      } else if (mod && e.shiftKey && e.key === "s") {
        e.preventDefault();
        editor.chain().focus().toggleStrike().run();
      }
    },
    [editor],
  );

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      // Don't override while user is typing and focused
      if (editor.isFocused) return;
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div
      data-rich-id={id}
      className="relative nodrag nowheel select-text"
      onKeyDown={handleKeyDown}
      style={{ outline: "none" }}
    >
      <EditorContent editor={editor} />
      {showBubble && bubblePos && typeof document !== "undefined"
        ? createPortal(
            <FloatingToolbar editor={editor} isVisible={showBubble} position={bubblePos} />,
            document.body,
          )
        : null}
    </div>
  );
}

export function FloatingToolbar({
  editor,
  isVisible,
  position,
}: {
  editor: ReturnType<typeof useEditor> | null;
  isVisible: boolean;
  position: { x: number; y: number } | null;
}) {
  if (!editor || !isVisible || !position) return null;

  return (
    <div
      className="fixed z-50 flex items-center gap-1 rounded-lg border border-border bg-popover px-2 py-1.5 shadow-lg"
      style={{ left: position.x, top: position.y - 44, transform: "translateX(-50%)" }}
      role="toolbar"
      aria-label="Text formatting"
    >
      <select
        value={
          editor.isActive("heading", { level: 1 })
            ? "heading1"
            : editor.isActive("heading", { level: 2 })
              ? "heading2"
              : editor.isActive("heading", { level: 3 })
                ? "heading3"
                : "paragraph"
        }
        onChange={(e) => {
          const val = e.target.value;
          editor.chain().focus().clearNodes().run();
          if (val !== "paragraph") {
            const lvl = parseInt(val.slice(-1)) as 1 | 2 | 3;
            editor.chain().focus().toggleHeading({ level: lvl }).run();
          }
        }}
        className="rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-foreground outline-none focus:ring-0"
      >
        <option value="paragraph">Paragraph</option>
        <option value="heading1">Heading 1</option>
        <option value="heading2">Heading 2</option>
        <option value="heading3">Heading 3</option>
      </select>

      <div className="w-px h-6 bg-border mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold transition-colors ${editor.isActive("bold") ? "bg-surface-active text-foreground" : "text-muted-foreground hover:bg-surface-hover"}`}
        title="Bold (⌘B)"
      >
        B
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`flex h-8 w-8 items-center justify-center rounded-md text-sm italic transition-colors ${editor.isActive("italic") ? "bg-surface-active text-foreground" : "text-muted-foreground hover:bg-surface-hover"}`}
        title="Italic (⌘I)"
      >
        I
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`flex h-8 w-8 items-center justify-center rounded-md text-sm underline transition-colors ${editor.isActive("underline") ? "bg-surface-active text-foreground" : "text-muted-foreground hover:bg-surface-hover"}`}
        title="Underline (⌘U)"
      >
        U
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`flex h-8 w-8 items-center justify-center rounded-md text-sm line-through transition-colors ${editor.isActive("strike") ? "bg-surface-active text-foreground" : "text-muted-foreground hover:bg-surface-hover"}`}
        title="Strikethrough (⌘⇧S)"
      >
        S
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`flex h-8 w-8 items-center justify-center rounded-md font-mono text-xs transition-colors ${editor.isActive("code") ? "bg-surface-active text-foreground" : "text-muted-foreground hover:bg-surface-hover"}`}
        title="Inline code"
      >
        {"</>"}
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <div className="relative group">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover transition-colors"
          title="Highlight"
        >
          <span
            style={{
              display: "inline-block",
              width: "16px",
              height: "12px",
              background:
                (editor.getAttributes("highlight") as Record<string, string>)["color"] ||
                "linear-gradient(90deg, var(--sut-highlight-sand), var(--sut-highlight-rose))",
              borderRadius: "2px",
              border: "1px solid var(--border)",
            }}
          />
        </button>
        <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-50">
          <div className="flex gap-1 rounded-lg border border-border bg-popover p-1 shadow-lg">
            {["Sand", "Apricot", "Rose", "Sage", "Sky", "Lavender"].map((name) => (
              <button
                key={name}
                type="button"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .setHighlight({ color: `var(--sut-highlight-${name.toLowerCase()})` })
                    .run()
                }
                title={name}
                className={`h-6 w-6 rounded transition-transform hover:scale-110 ${(editor.getAttributes("highlight") as Record<string, string>)["color"] === `var(--sut-highlight-${name.toLowerCase()})` ? "ring-2 ring-primary ring-offset-1" : ""}`}
                style={{ background: `var(--sut-highlight-${name.toLowerCase()})` }}
              />
            ))}
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
              className="flex h-6 w-6 items-center justify-center rounded border border-dashed border-border hover:bg-surface-hover"
              title="Remove highlight"
            >
              <span className="text-[10px] text-muted-foreground">×</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative group">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover transition-colors"
          title="Text color"
        >
          <span
            style={{
              display: "inline-block",
              width: "16px",
              height: "12px",
              background:
                (editor.getAttributes("textStyle") as Record<string, string>)["color"] ||
                "linear-gradient(90deg, #0f172a, #7c3aed)",
              borderRadius: "2px",
              border: "1px solid var(--border)",
            }}
          />
        </button>
        <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-50">
          <div className="flex gap-1 rounded-lg border border-border bg-popover p-1 shadow-lg">
            {[
              { n: "Default", v: "" },
              { n: "Ink", v: "#0f172a" },
              { n: "Clay", v: "#78350f" },
              { n: "Rose", v: "#be123c" },
              { n: "Sage", v: "#15803d" },
              { n: "Blue", v: "#1d4ed8" },
              { n: "Lavender", v: "#7c3aed" },
            ].map((c) => (
              <button
                key={c.n}
                type="button"
                onClick={() => {
                  if (c.v) editor.chain().focus().setColor(c.v).run();
                  else editor.chain().focus().unsetColor().run();
                }}
                title={c.n}
                className={`h-6 w-6 rounded transition-transform hover:scale-110 ${(editor.getAttributes("textStyle") as Record<string, string>)["color"] === c.v ? "ring-2 ring-primary ring-offset-1" : ""}`}
                style={
                  c.v
                    ? { background: c.v }
                    : { background: "linear-gradient(90deg, #0f172a, #7c3aed)" }
                }
              />
            ))}
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetColor().run()}
              className="flex h-6 w-6 items-center justify-center rounded border border-dashed border-border hover:bg-surface-hover"
              title="Default"
            >
              <span className="text-[10px] text-muted-foreground">×</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${(editor.getAttributes("paragraph") as Record<string, string>)["textAlign"] === "left" || !(editor.getAttributes("paragraph") as Record<string, string>)["textAlign"] ? "bg-surface-active text-foreground" : "text-muted-foreground hover:bg-surface-hover"}`}
        title="Align left"
      >
        <span className="text-xs">≡</span>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${(editor.getAttributes("paragraph") as Record<string, string>)["textAlign"] === "center" ? "bg-surface-active text-foreground" : "text-muted-foreground hover:bg-surface-hover"}`}
        title="Align center"
      >
        <span className="text-xs">≡</span>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${(editor.getAttributes("paragraph") as Record<string, string>)["textAlign"] === "right" ? "bg-surface-active text-foreground" : "text-muted-foreground hover:bg-surface-hover"}`}
        title="Align right"
      >
        <span className="text-xs">≡</span>
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover transition-colors"
        title="Bullet list"
      >
        •
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover transition-colors"
        title="Numbered list"
      >
        1.
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover transition-colors"
        title="Task list"
      >
        ☐
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <button
        type="button"
        onClick={() => {
          const url = window.prompt("Enter URL:", "https://");
          if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover transition-colors"
        title="Add link (⌘K)"
      >
        🔗
      </button>
    </div>
  );
}
