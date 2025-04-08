import { motion } from "framer-motion";
import { Icons } from "../icons";
import { useTranslation } from "react-i18next";

export function EmptyState() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white/80 p-16 text-center shadow-sm dark:border-gray-700/60 dark:bg-gray-800/40 backdrop-blur-sm"
    >
      <div className="mb-8 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-inner ring-1 ring-gray-200/70 dark:from-gray-800/70 dark:to-gray-900/70 dark:ring-gray-700/30">
        <Icons.EmptyFolder className="h-16 w-16 text-gray-400 dark:text-gray-300" />
      </div>
      <h3 className="mb-3 text-2xl font-medium text-gray-900 dark:text-white">
        {t("common.emptyFolder")}
      </h3>
      <p className="max-w-md text-gray-600 dark:text-gray-300">
        {t("common.emptyFolderDescription")}
      </p>
    </motion.div>
  );
}
