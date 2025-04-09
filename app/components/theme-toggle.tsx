import { useEffect, useState, useCallback } from "react";
import { Icons } from "./icons";
import { motion } from "framer-motion";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getEffectiveTheme = () => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return theme;
  };

  const toggleTheme = useCallback(() => {
    if (isToggling) return;

    setIsToggling(true);
    const currentEffectiveTheme = getEffectiveTheme();
    setTheme(currentEffectiveTheme === "dark" ? "light" : "dark");

    setTimeout(() => {
      setIsToggling(false);
    }, 300);
  }, [isToggling, setTheme]);

  if (!mounted) return null;

  const effectiveTheme = getEffectiveTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative overflow-hidden rounded-xl bg-white/60 p-2.5 text-gray-700 shadow-sm backdrop-blur-sm transition-all hover:bg-gray-50/80 hover:text-blue-600 hover:shadow-md dark:bg-gray-800/60 dark:text-gray-300 dark:hover:bg-gray-700/80 dark:hover:text-blue-400 sm:p-3 border border-gray-200/60 dark:border-gray-700/60"
      whileTap={{ scale: 0.94 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      aria-label={`Switch to ${
        effectiveTheme === "dark" ? "light" : "dark"
      } theme`}
    >
      <div className="relative z-10">
        {effectiveTheme === "dark" ? (
          <Icons.Sun className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200 hover:rotate-45" />
        ) : (
          <Icons.Moon className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200 hover:-rotate-12" />
        )}
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-gray-100/50 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100 dark:via-gray-600/30" />
      <span className="sr-only">
        Switch to {effectiveTheme === "dark" ? "light" : "dark"} mode
      </span>
    </motion.button>
  );
}
