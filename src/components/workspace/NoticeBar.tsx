import { AnimatePresence, motion } from "motion/react";
import { Info, CheckCircle2, XCircle } from "lucide-react";
import { useNoticeStore, type NoticeKind } from "@/lib/notice-store";

const kindStyles: Record<NoticeKind, string> = {
  info: "bg-popover border-border text-foreground",
  success: "bg-popover border-border text-foreground",
  error: "bg-destructive/10 border-destructive/30 text-destructive",
};

const kindIcon: Record<NoticeKind, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  error: XCircle,
};

export function NoticeBar() {
  const notice = useNoticeStore((s) => s.notice);
  const dismiss = useNoticeStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed left-1/2 top-12 z-[60] -translate-x-1/2">
      <AnimatePresence>
        {notice &&
          (() => {
            const Icon = kindIcon[notice.kind];
            return (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className={`pointer-events-auto flex items-center gap-2 rounded-xl border px-4 py-2 shadow-lg backdrop-blur-md ${kindStyles[notice.kind]}`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                <span className="text-sm font-medium">{notice.message}</span>
                <button
                  type="button"
                  onClick={dismiss}
                  className="ml-1 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Dismiss"
                >
                  <XCircle className="h-3 w-3" />
                </button>
              </motion.div>
            );
          })()}
      </AnimatePresence>
    </div>
  );
}
