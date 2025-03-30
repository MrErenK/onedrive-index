import { Icons } from "./icons";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function ViewToggle({
  viewMode,
  setViewMode,
  className = "",
}: {
  viewMode: "list" | "grid";
  setViewMode: (mode: "list" | "grid") => void;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <motion.div
      className={`flex justify-end ${className}`}
      role="toolbar"
      aria-label="View options"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div
        className="inline-flex rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        role="group"
        aria-label="View mode selection"
      >
        <motion.button
          type="button"
          onClick={() => setViewMode("list")}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              setViewMode("grid");
            }
          }}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          aria-pressed={viewMode === "list"}
          aria-label={t("common.listView")}
          className={`relative rounded-l-lg border px-5 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            viewMode === "list"
              ? "border-blue-600 bg-gradient-to-r from-blue-600 to-blue-700 text-white"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <Icons.List className="h-5 w-5 md:h-6 md:w-6" />
          <span className="sr-only">{t("common.listView")}</span>
          {viewMode === "list" && (
            <motion.span
              layoutId="viewModeIndicator"
              className="absolute inset-0 rounded-l-lg border-2 border-blue-400 bg-transparent"
              initial={false}
              transition={{ type: "spring", stiffness: 600, damping: 35 }}
            />
          )}
        </motion.button>
        <motion.button
          type="button"
          onClick={() => setViewMode("grid")}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              setViewMode("list");
            }
          }}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          aria-pressed={viewMode === "grid"}
          aria-label={t("common.gridView")}
          className={`relative rounded-r-lg border px-5 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            viewMode === "grid"
              ? "border-blue-600 bg-gradient-to-r from-blue-600 to-blue-700 text-white"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <Icons.Grid className="h-5 w-5 md:h-6 md:w-6" />
          <span className="sr-only">{t("common.gridView")}</span>
          {viewMode === "grid" && (
            <motion.span
              layoutId="viewModeIndicator"
              className="absolute inset-0 rounded-r-lg border-2 border-blue-400 bg-transparent"
              initial={false}
              transition={{ type: "spring", stiffness: 600, damping: 35 }}
            />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
