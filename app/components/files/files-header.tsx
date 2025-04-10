import { Icons } from "../icons";
import { ViewToggle } from "../view-toggle";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function FilesHeader({
  viewMode,
  setViewMode,
  fileCount,
}: {
  viewMode: "list" | "grid";
  setViewMode: (mode: "list" | "grid") => void;
  fileCount: number;
}) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mb-6"
    >
      <div className="flex items-center justify-between bg-white/80 dark:bg-gray-900/60 backdrop-blur-md rounded-xl px-5 py-4 border border-gray-200 dark:border-gray-800/80 shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
            <Icons.Folder className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white tracking-tight">
            {t("common.files")}
          </h1>
          {fileCount > 0 && (
            <span className="ml-2 rounded-full bg-gray-100/80 dark:bg-gray-800/80 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50">
              {fileCount}{" "}
              {fileCount === 1 ? t("common.item") : t("common.items")}
            </span>
          )}
          <motion.a
            href="/download-script"
            download
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="ml-2 inline-flex items-center rounded-lg bg-blue-50 hover:bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 border border-blue-200/50 transition-colors duration-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50 dark:hover:bg-blue-900/50"
          >
            <Icons.Download className="mr-2 h-4 w-4" />
            {t("common.downloadScript")}
          </motion.a>
        </div>
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>
    </motion.div>
  );
}
