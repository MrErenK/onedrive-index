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
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-5"
    >
      <div className="flex items-center justify-between bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-100 dark:border-gray-800/60 shadow-sm">
        <div className="flex items-center gap-2">
          <Icons.Folder className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
            {t("common.files")}
          </h1>
          {fileCount > 0 && (
            <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {fileCount}{" "}
              {fileCount === 1 ? t("common.item") : t("common.items")}
            </span>
          )}
        </div>
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>
    </motion.div>
  );
}
