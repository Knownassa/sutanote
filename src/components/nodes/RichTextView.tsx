import { memo, useMemo } from "react";

/**
 * Lightweight, read-only renderer for rich text content.
 *
 * Renders stored HTML directly — no Tiptap/ProseMirror instance.
 * Text nodes use this whenever they are NOT being edited, so a note-heavy
 * board mounts 0 editors instead of one per card.
 */
function sanitize(html: string): string {
  return (
    html
      // drop script/style/iframe/object blocks entirely
      .replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
      // drop inline event handlers
      .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      // neutralise javascript: urls
      .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1="#"')
  );
}

interface RichTextViewProps {
  html: string;
  plainText?: string;
  placeholder?: string;
}

function RichTextViewImpl({
  html,
  plainText,
  placeholder = "Start writing...",
}: RichTextViewProps) {
  const safe = useMemo(() => sanitize(html ?? ""), [html]);
  const isEmpty = !plainText?.trim() && !safe.replace(/<[^>]*>/g, "").trim();

  if (isEmpty) {
    return (
      <div className="prose prose-sm max-w-none min-h-[80px] text-muted-foreground/50">
        {placeholder}
      </div>
    );
  }

  return (
    <div
      className="prose prose-sm max-w-none min-h-[80px]"
      // Content is authored locally by the user in their own vault.
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}

export const RichTextView = memo(RichTextViewImpl);
