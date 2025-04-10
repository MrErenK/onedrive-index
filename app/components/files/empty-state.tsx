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
      className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white/80 p-16 text-center shadow-md dark:border-gray-700/60 dark:bg-gray-800/40 backdrop-blur-sm hover:shadow-lg transition-shadow"
    >
      <div className="mb-8 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 p-7 shadow-inner ring-1 ring-indigo-200/70 dark:from-indigo-900/40 dark:to-blue-800/40 dark:ring-indigo-700/30 transform hover:scale-105 transition-transform duration-300">
        <Icons.EmptyFolder className="h-20 w-20 text-indigo-400 dark:text-indigo-300 animate-pulse" />
      </div>
      <h3 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
        {t("common.emptyFolder")}
      </h3>
      <p className="max-w-md text-gray-600 dark:text-gray-300 leading-relaxed">
        {t("common.emptyFolderDescription")}
      </p>
    </motion.div>
  );
}
