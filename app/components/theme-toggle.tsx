import { useEffect, useState, useCallback } from "react";
import { Icons } from "./icons";
import { motion } from "framer-motion";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Prevent hydration mismatch by rendering nothing until mounted
  if (!mounted) {
    return null;
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className="flex items-center justify-center rounded-full p-2.5 text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 transition-colors duration-200 shadow-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 sm:p-3"
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? (
        <Icons.Sun className="h-5 w-5 sm:h-6 sm:w-6" />
      ) : (
        <Icons.Moon className="h-5 w-5 sm:h-6 sm:w-6" />
      )}
      <span className="sr-only">
        Switch to {theme === "dark" ? "light" : "dark"} mode
      </span>
    </motion.button>
  );
}
