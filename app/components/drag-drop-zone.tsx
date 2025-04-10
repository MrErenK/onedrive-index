import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Icons } from "./icons";

interface DragDropZoneProps {
  isDragging: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onClick: () => void;
  onUrlUploadClick: () => void;
}

export function DragDropZone({
  isDragging,
  onDrop,
  onDragOver,
  onDragLeave,
  onClick,
  onUrlUploadClick,
}: DragDropZoneProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border-2 border-dashed p-6 transition-all duration-200 cursor-pointer ${
        isDragging
          ? "border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-900/20"
          : "border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/20"
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
          <Icons.Upload className="h-8 w-8 text-gray-600 dark:text-gray-300" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isDragging ? t("upload.dropFiles") : t("upload.dragFiles")}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("upload.dragDescription")}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            <Icons.Upload className="mr-2 h-4 w-4" />
            {t("upload.selectFiles")}
          </motion.button>

          <motion.button
            onClick={onUrlUploadClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Icons.Link className="mr-2 h-4 w-4" />
            {t("upload.uploadFromUrl")}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
