import { useCallback, useEffect, useRef, useState } from "react";

/**
 * HeavyNode lifecycle.
 *
 * Heavy items (embeds, video, PDF) go through three phases:
 *  - idle:        off-screen. Nothing expensive is mounted at all.
 *  - visible:     on-screen but passive. Cheap poster/thumbnail only.
 *  - interactive: the user asked for it. The real iframe/player/viewer mounts.
 *
 * Leaving the viewport or pressing Escape drops back out of `interactive`, so
 * a board with 30 embeds never keeps 30 iframes alive.
 */
export type HeavyPhase = "idle" | "visible" | "interactive";

export function heavyPhase(visible: boolean, interactive: boolean): HeavyPhase {
  if (interactive && visible) return "interactive";
  return visible ? "visible" : "idle";
}

export function useHeavyNode<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setVisible(entry.isIntersecting);
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Release heavy content when it scrolls away.
  useEffect(() => {
    if (!visible && interactive) setInteractive(false);
  }, [visible, interactive]);

  // Escape tears the heavy content down.
  useEffect(() => {
    if (!interactive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInteractive(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [interactive]);

  const activate = useCallback(() => setInteractive(true), []);
  const deactivate = useCallback(() => setInteractive(false), []);

  return { ref, phase: heavyPhase(visible, interactive), activate, deactivate };
}
