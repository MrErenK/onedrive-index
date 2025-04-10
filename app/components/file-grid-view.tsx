import { Link, useLocation } from "@remix-run/react";
import { Icons } from "./icons";
import type { DriveItem } from "~/utils/onedrive.server";
import { formatFileSize } from "~/utils/format";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function FileGridView({
  files,
  currentPath,
}: {
  files: DriveItem[];
  currentPath: string;
}) {
  const location = useLocation();
  const { t } = useTranslation();

  const getPathFromUrl = () => {
    if (currentPath) return currentPath;
    const folderParam = new URLSearchParams(location.search).get("folder");

    // Make sure the path always ends with a slash if it's not empty
    if (folderParam) {
      return folderParam.endsWith("/") ? folderParam : `${folderParam}/`;
    }
    return "";
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
      {files.map((file, index) => (
        <motion.div
          key={file.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.03,
            ease: "easeOut",
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            to={
              file.folder
                ? `/files?folder=${encodeURIComponent(
                    `${getPathFromUrl()}/${file.name}`
                  )}`
                : `/files/view/${encodeURIComponent(
                    `${getPathFromUrl()}/${file.name}`
                  )}`
            }
            className="group flex h-full flex-col rounded-xl border border-gray-200/70 bg-white/60 backdrop-blur-sm p-3 shadow-sm transition-all duration-200 hover:border-blue-400/30 hover:bg-blue-50/30 hover:shadow-md dark:border-gray-700/50 dark:bg-gray-800/50 dark:hover:border-blue-500/30 dark:hover:bg-blue-900/20"
            aria-label={
              file.folder ? `Open ${file.name} folder` : `View ${file.name}`
            }
          >
            <div className="flex items-center justify-center my-2 relative">
              {file.folder ? (
                <div className="flex h-16 items-center justify-center text-amber-500/90 dark:text-amber-400/90">
                  <Icons.Folder className="h-14 w-14 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-2deg]" />
                </div>
              ) : (
                <div className="flex h-16 items-center justify-center text-blue-500/90 dark:text-blue-400/90">
                  <Icons.File className="h-14 w-14 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[2deg]" />
                </div>
              )}
            </div>

            <div className="text-center w-full px-1">
              <span
                className="block font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-2 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400"
                title={file.name}
              >
                {file.name}
              </span>

              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {file.folder ? (
                  <span className="flex flex-col items-center gap-1">
                    {file.folder.childCount}{" "}
                    {file.folder.childCount === 1 ? "item" : "items"}
                  </span>
                ) : (
                  formatFileSize(file.size)
                )}
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                {new Date(file.lastModifiedDateTime).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {!file.folder && (
              <div className="mt-auto pt-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Link
                  to={`/files/download/${encodeURIComponent(
                    `${getPathFromUrl()}/${file.name}`
                  )}`}
                  className="w-full inline-flex items-center justify-center rounded-md bg-blue-100/80 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200/80 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-800/60"
                  reloadDocument
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icons.Download className="mr-1.5 h-3.5 w-3.5" />
                  {t("common.download")}
                </Link>
              </div>
            )}
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
