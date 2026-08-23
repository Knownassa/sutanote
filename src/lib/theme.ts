import { useEffect } from "react";
import { useSettingsStore, type ThemePreference } from "./settings-store";

function resolveDark(theme: ThemePreference): boolean {
  if (theme === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches;
  return theme === "dark";
}

export function useThemeManager() {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    const apply = () => {
      const dark = resolveDark(theme);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
    return;
  }, [theme]);
}
