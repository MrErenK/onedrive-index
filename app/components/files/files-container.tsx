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
      className="relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm transition-all dark:bg-black/50"
          >
            <LoadingSpinner
              size="medium"
              className="border-4 border-gray-300/30 border-t-blue-600 dark:border-gray-600/30 dark:border-t-blue-400"
            />
            <span className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-300">
              {t("common.loading")}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`backdrop-blur-sm rounded-xl overflow-hidden ${
          isLoading ? "pointer-events-none" : ""
        }`}
      >
        {files.length === 0 ? (
          <EmptyState />
        ) : viewMode === "list" ? (
          <div className="bg-white/80 dark:bg-gray-900/40 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800/60 overflow-hidden">
            <FileListView
              files={files}
              currentPath={currentPath}
              onSort={onSort}
              sortField={sortField}
              sortDirection={sortDirection}
            />
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-gray-900/40 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800/60 p-4">
            <FileGridView files={files} currentPath={currentPath} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
