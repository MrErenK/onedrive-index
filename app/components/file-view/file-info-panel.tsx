import { motion } from "framer-motion";
import { Icons } from "../icons";
import { useTranslation } from "react-i18next";
import { formatFileSize } from "~/utils/format";

export function FileInfoPanel({ fileDetails }: { fileDetails: any }) {
  const { t } = useTranslation();

  const mimeType = fileDetails.file?.mimeType;
  const extension = fileDetails.name.split(".").pop()?.toUpperCase();
  const fileType = mimeType
    ? mimeType.split("/")[1]?.toUpperCase()
    : extension || "File";

  const fileCreatedDate = fileDetails.createdDateTime
    ? new Date(fileDetails.createdDateTime)
    : null;

  const fileModifiedDate = fileDetails.lastModifiedDateTime
    ? new Date(fileDetails.lastModifiedDateTime)
    : null;

  return (
    <motion.div
      className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-800/70 overflow-hidden shadow-md h-full transition-colors duration-200"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="px-5 py-3.5 border-b border-gray-200 dark:border-gray-800/70 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/80">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
          <Icons.FileType className="mr-2 h-4 w-4.5 text-blue-500 dark:text-blue-400" />
          {t("fileView.fileInfo")}
        </h2>
      </div>

      <dl className="divide-y divide-gray-100 dark:divide-gray-800/60">
        <div className="px-5 py-3 grid grid-cols-[1fr,auto] items-center gap-2 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors duration-150">
          <dt className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">
            <Icons.FileType className="mr-2 h-4 w-4 text-blue-500/80 dark:text-blue-400/80" />
            {t("fileView.type")}
          </dt>
          <dd className="text-sm text-gray-900 dark:text-white">
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/20 dark:bg-blue-900/40 dark:text-blue-300 dark:ring-blue-500/30 shadow-sm">
              {fileType}
            </span>
          </dd>
        </div>

        {fileDetails.size && (
          <div className="px-5 py-3 grid grid-cols-[1fr,auto] items-center gap-2 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors duration-150">
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">
              <Icons.FileSize className="mr-2 h-4 w-4 text-green-500/80 dark:text-green-400/80" />
              {t("fileView.size")}
            </dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-white">
              {formatFileSize(fileDetails.size)}
            </dd>
          </div>
        )}

        {fileModifiedDate && (
          <div className="px-5 py-3 grid grid-cols-1 gap-1.5 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors duration-150">
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">
              <Icons.Calendar className="mr-2 h-4 w-4 text-amber-500/80 dark:text-amber-400/80" />
              {t("fileView.modified")}
            </dt>
            <dd className="text-sm text-gray-900 dark:text-white flex gap-2 items-center pl-6">
              <span className="font-medium">
                {fileModifiedDate.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-300">
                {fileModifiedDate.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </dd>
          </div>
        )}

        {fileCreatedDate && (
          <div className="px-5 py-3 grid grid-cols-1 gap-1.5 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors duration-150">
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">
              <Icons.Calendar className="mr-2 h-4 w-4 text-purple-500/80 dark:text-purple-400/80" />
              {t("fileView.created")}
            </dt>
            <dd className="text-sm text-gray-900 dark:text-white flex gap-2 items-center pl-6">
              <span className="font-medium">
                {fileCreatedDate.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-300">
                {fileCreatedDate.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </dd>
          </div>
        )}
      </dl>
    </motion.div>
  );
}
