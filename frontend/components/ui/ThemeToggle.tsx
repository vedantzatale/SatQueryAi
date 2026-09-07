"use client";

import { Monitor, Sun, Moon } from "lucide-react";
import { useTheme, type ThemeOption } from "@/lib/theme";

const OPTIONS: { value: ThemeOption; icon: React.ReactNode; label: string }[] =
  [
    {
      value: "default",
      icon: <Monitor className="h-3.5 w-3.5" />,
      label: "System",
    },
    {
      value: "light",
      icon: <Sun className="h-3.5 w-3.5" />,
      label: "Light",
    },
    {
      value: "dark",
      icon: <Moon className="h-3.5 w-3.5" />,
      label: "Dark",
    },
  ];

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  return (
    <div
      className={`
        flex items-center gap-0.5
        h-[34px] px-1
        rounded-full
        border transition-colors duration-200
        ${
          isLight
            ? "border-black/10 bg-[#ede8df]"
            : "border-white/10 bg-white/5 backdrop-blur-sm"
        }
      `}
      role="radiogroup"
      aria-label="Theme selector"
    >
      {OPTIONS.map(({ value, icon, label }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={isActive}
            aria-label={`${label} theme`}
            onClick={() => setTheme(value)}
            title={label}
            className={`
              relative flex items-center justify-center
              h-[26px] w-[26px] rounded-full
              transition-all duration-200
              outline-none
              ${
                isActive
                  ? isLight
                    ? "bg-white text-[#18181b] shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] border border-black/5"
                    : "bg-white/20 text-white shadow-sm"
                  : isLight
                    ? "text-neutral-500 hover:text-neutral-900"
                    : "text-neutral-400 hover:text-neutral-200"
              }
            `}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}

/** Same toggle but in a row layout with visible text labels — for mobile menus */
export function ThemeToggleLabeled() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  return (
    <div className="flex items-center gap-1 pt-1">
      {OPTIONS.map(({ value, icon, label }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`
              flex-1 flex items-center justify-center gap-1.5
              py-1.5 px-2 rounded-xl text-xs font-medium
              transition-all duration-200 border
              ${
                isActive
                  ? isLight
                    ? "bg-white text-[#18181b] border-black/10 shadow-sm"
                    : "bg-white/15 border-white/25 text-white"
                  : isLight
                    ? "border-transparent text-neutral-500 hover:text-neutral-800 hover:bg-black/5"
                    : "border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
              }
            `}
          >
            {icon}
            {label}
          </button>
        );
      })}
    </div>
  );
}
