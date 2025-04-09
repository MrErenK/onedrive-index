import { Link, useLocation } from "@remix-run/react";
import { Icons } from "./icons";
import type { DriveItem } from "~/utils/onedrive.server";
import { formatFileSize } from "~/utils/format";
import { motion } from "framer-motion";
import { useState } from "react";
import { copyToClipboard } from "~/utils/copy";
import { useTranslation } from "react-i18next";

type SortField = "name" | "modified" | "size";
type SortDirection = "asc" | "desc";

interface FileListViewProps {
  files: DriveItem[];
  currentPath: string;
  onSort?: (field: string, direction: string) => void;
  sortField?: string;
  sortDirection?: string;
}

export function FileListView({
  files,
  currentPath,
  onSort,
  sortField = "name",
  sortDirection = "asc",
}: FileListViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (field !== sortField) return null;

    return (
      <Icons.ChevronUp
        className={`ml-1 h-4 w-4 transition-transform ${
          sortDirection === "desc" ? "rotate-180" : ""
        }`}
      />
    );
  };

  const handleSort = (field: SortField) => {
    if (onSort) {
      const newDirection =
        field === sortField
          ? sortDirection === "asc"
            ? "desc"
            : "asc"
          : "asc";
      onSort(field, newDirection);
    }
  };

  const handleCopyLink = async (file: DriveItem) => {
    // Build the file's path
    const filePath = encodeURIComponent(`${getPathFromUrl()}${file.name}`);
    const url = `${window.location.origin}/files/download/${filePath}`;
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border-0 bg-transparent">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        <table className="min-w-full divide-y divide-gray-200/70 dark:divide-gray-700/50">
          <thead>
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  {t("common.name")}
                  <SortIndicator field="name" />
                </div>
              </th>
              <th
                scope="col"
                className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 lg:table-cell"
                onClick={() => handleSort("modified")}
              >
                <div className="flex items-center">
                  {t("common.modified")}
                  <SortIndicator field="modified" />
                </div>
              </th>
              <th
                scope="col"
                className="hidden px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 md:table-cell"
                onClick={() => handleSort("size")}
              >
                <div className="flex items-center">
                  {t("common.size")}
                  <SortIndicator field="size" />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300"
              >
                {t("common.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/70 dark:divide-gray-700/50">
            {files.map((file, index) => (
              <motion.tr
                key={file.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className="group transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/50"
              >
                <td className="whitespace-nowrap px-6 py-4">
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
                    className="flex items-center"
                  >
                    <div className="flex-shrink-0 text-gray-400 transition-transform group-hover:scale-110">
                      {file.folder ? (
                        <motion.div whileHover={{ scale: 1.15, rotate: -5 }}>
                          <Icons.Folder className="h-5 w-5 text-amber-500 drop-shadow-sm" />
                        </motion.div>
                      ) : (
                        <motion.div whileHover={{ scale: 1.15, rotate: 5 }}>
                          <Icons.File className="h-5 w-5 text-blue-500 drop-shadow-sm" />
                        </motion.div>
                      )}
                    </div>
                    <span
                      className="ml-3 font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate max-w-[200px] sm:max-w-xs md:max-w-sm lg:max-w-md"
                      title={file.name}
                    >
                      {file.name}
                    </span>
                  </Link>
                </td>
                <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400 lg:table-cell">
                  {new Date(file.lastModifiedDateTime).toLocaleString(
                    undefined,
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </td>
                <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400 md:table-cell">
                  {file.folder ? (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                      {file.folder.childCount}{" "}
                      {file.folder.childCount === 1
                        ? t("common.item")
                        : t("common.items")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {formatFileSize(file.size)}
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  {!file.folder ? (
                    <div className="flex justify-end">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex"
                      >
                        <motion.button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCopyLink(file);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center rounded-full p-2 text-gray-700 hover:bg-blue-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
                          title={
                            copiedId === file.id
                              ? t("copy.copied") + "!"
                              : t("copy.copyLink")
                          }
                        >
                          {copiedId === file.id ? (
                            <Icons.Check className="h-5 w-5" />
                          ) : (
                            <Icons.Link className="h-5 w-5" />
                          )}
                        </motion.button>
                        <Link
                          to={`/files/download/${encodeURIComponent(
                            `${getPathFromUrl()}/${file.name}`
                          )}`}
                          className="inline-flex items-center rounded-full p-2 text-gray-700 hover:bg-blue-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
                          reloadDocument
                          aria-label={t("common.downloadFile")}
                          title={t("common.downloadFile")}
                        >
                          <Icons.Download className="h-5 w-5" />
                        </Link>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          to={`/files?folder=${encodeURIComponent(
                            `${getPathFromUrl()}/${file.name}`
                          )}`}
                          className="inline-flex items-center rounded-full p-2 text-gray-700 hover:bg-amber-100 hover:text-amber-600 dark:text-gray-300 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 transition-colors"
                          aria-label={t("common.openFolder")}
                          title={t("common.openFolder")}
                        >
                          <Icons.Folder className="h-5 w-5" />
                        </Link>
                      </motion.div>
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
