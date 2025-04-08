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
      className="bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-800/60 overflow-hidden shadow-sm h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800/60">
        <h2 className="text-base font-medium text-gray-900 dark:text-white flex items-center">
          <Icons.FileType className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          {t("fileView.fileInfo")}
        </h2>
      </div>

      <dl className="divide-y divide-gray-100 dark:divide-gray-800/60">
        <div className="px-4 py-2.5 grid grid-cols-[1fr,auto] items-center gap-2">
          <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
            <Icons.FileType className="mr-1.5 h-3.5 w-3.5 opacity-70" />
            {t("fileView.type")}
          </dt>
          <dd className="text-sm text-gray-900 dark:text-white">
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-500/20">
              {fileType}
            </span>
          </dd>
        </div>

        {fileDetails.size && (
          <div className="px-4 py-2.5 grid grid-cols-[1fr,auto] items-center gap-2">
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
              <Icons.FileSize className="mr-1.5 h-3.5 w-3.5 opacity-70" />
              {t("fileView.size")}
            </dt>
            <dd className="text-sm text-gray-900 dark:text-white">
              {formatFileSize(fileDetails.size)}
            </dd>
          </div>
        )}

        {fileModifiedDate && (
          <div className="px-4 py-2.5 grid grid-cols-1 gap-1">
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
              <Icons.Calendar className="mr-1.5 h-3.5 w-3.5 opacity-70" />
              {t("fileView.modified")}
            </dt>
            <dd className="text-sm text-gray-900 dark:text-white flex gap-1 items-center">
              <span>
                {fileModifiedDate.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {fileModifiedDate.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </dd>
          </div>
        )}

        {fileCreatedDate && (
          <div className="px-4 py-2.5 grid grid-cols-1 gap-1">
            <dt className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
              <Icons.Calendar className="mr-1.5 h-3.5 w-3.5 opacity-70" />
              {t("fileView.created")}
            </dt>
            <dd className="text-sm text-gray-900 dark:text-white flex gap-1 items-center">
              <span>
                {fileCreatedDate.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
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
