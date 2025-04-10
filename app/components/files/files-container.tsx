import { motion, AnimatePresence } from "framer-motion";
import { FileListView } from "../file-list-view";
import { FileGridView } from "../file-grid-view";
import { LoadingSpinner } from "../loading-spinner";
import { EmptyState } from "./empty-state";
import { useTranslation } from "react-i18next";
import type { DriveItem } from "~/utils/onedrive.server";

interface FilesContainerProps {
  files: DriveItem[];
  currentPath: string;
  viewMode: "list" | "grid";
  isLoading: boolean;
  onSort?: (field: string, direction: string) => void;
  sortField?: string;
  sortDirection?: string;
}

export function FilesContainer({
  files,
  currentPath,
  viewMode,
  isLoading,
  onSort,
  sortField = "name",
  sortDirection = "asc",
}: FilesContainerProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      className="relative w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-white/80 backdrop-blur-md transition-all dark:bg-black/60 shadow-lg"
          >
            <LoadingSpinner
              size="medium"
              className="border-4 border-gray-300/40 border-t-blue-600 dark:border-gray-600/40 dark:border-t-blue-500 shadow-sm"
            />
            <span className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-200 tracking-wide">
              {t("common.refreshing")}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`backdrop-blur-md rounded-xl overflow-hidden transition-all duration-300 ${
          isLoading
            ? "pointer-events-none opacity-90 scale-[0.99]"
            : "transform-gpu hover:shadow-md"
        }`}
      >
        {files.length === 0 ? (
          <EmptyState />
        ) : viewMode === "list" ? (
          <div className="bg-white/90 dark:bg-gray-900/60 rounded-xl shadow-md border border-gray-100 dark:border-gray-800/70 overflow-hidden hover:border-gray-200 dark:hover:border-gray-700/80 transition-colors">
            <FileListView
              files={files}
              currentPath={currentPath}
              onSort={onSort}
              sortField={sortField}
              sortDirection={sortDirection}
            />
          </div>
        ) : (
          <div className="bg-white/90 dark:bg-gray-900/60 rounded-xl shadow-md border border-gray-100 dark:border-gray-800/70 p-6 hover:border-gray-200 dark:hover:border-gray-700/80 transition-colors">
            <FileGridView files={files} currentPath={currentPath} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
