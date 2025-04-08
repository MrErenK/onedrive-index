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
        className="inline-flex rounded-xl overflow-hidden shadow-sm border border-gray-200/60 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm"
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
          whileTap={{ scale: 0.95 }}
          aria-pressed={viewMode === "list"}
          aria-label={t("common.listView")}
          className={`relative px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
            viewMode === "list"
              ? "bg-gradient-to-br from-blue-500/90 to-blue-600/90 text-white dark:from-blue-500/80 dark:to-blue-600/80"
              : "text-gray-700 hover:text-blue-600 hover:bg-gray-50/80 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:bg-gray-700/50"
          }`}
        >
          <div className="relative z-10">
            <Icons.List className="h-5 w-5" />
          </div>
          <span className="sr-only">{t("common.listView")}</span>
          {viewMode === "list" && (
            <motion.div
              layoutId="viewModeIndicator"
              className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/20 dark:from-blue-400/20 dark:to-blue-500/20"
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
          whileTap={{ scale: 0.95 }}
          aria-pressed={viewMode === "grid"}
          aria-label={t("common.gridView")}
          className={`relative px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
            viewMode === "grid"
              ? "bg-gradient-to-br from-blue-500/90 to-blue-600/90 text-white dark:from-blue-500/80 dark:to-blue-600/80"
              : "text-gray-700 hover:text-blue-600 hover:bg-gray-50/80 dark:text-gray-200 dark:hover:text-blue-400 dark:hover:bg-gray-700/50"
          }`}
        >
          <div className="relative z-10">
            <Icons.Grid className="h-5 w-5" />
          </div>
          <span className="sr-only">{t("common.gridView")}</span>
          {viewMode === "grid" && (
            <motion.div
              layoutId="viewModeIndicator"
              className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-blue-600/20 dark:from-blue-400/20 dark:to-blue-500/20"
              initial={false}
              transition={{ type: "spring", stiffness: 600, damping: 35 }}
            />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
