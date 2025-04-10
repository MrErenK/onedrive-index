import { Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { Icons } from "../icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { copyToClipboard } from "~/utils/copy";
import { formatFilePath } from "~/utils/format";

interface FileViewHeaderProps {
  user: any;
  fileDetails: any;
  downloadUrl: string;
}

export function FileViewHeader({
  user,
  fileDetails,
  downloadUrl,
}: FileViewHeaderProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { t } = useTranslation();

  const handleCopyLink = async () => {
    const currentPath = window.location.pathname;
    const downloadPath = currentPath.replace(
      "/files/view/",
      "/files/download/"
    );
    const url = `${window.location.origin}${downloadPath}`;

    const success = await copyToClipboard(url);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200/70 bg-white/80 backdrop-blur-xl backdrop-saturate-150 shadow-md dark:border-gray-800/70 dark:bg-gray-900/80">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Link
                to={
                  fileDetails?.parentReference
                    ? `/files?folder=${encodeURIComponent(
                        fileDetails.parentReference.path.replace(
                          "/drive/root:",
                          ""
                        )
                      )}`
                    : "/files"
                }
                className="group flex items-center justify-center rounded-full bg-gray-100 p-2.5 text-gray-600 transition-all hover:bg-blue-100 hover:text-blue-700 hover:shadow-sm dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                aria-label="Back to files"
              >
                <Icons.Back className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
              </Link>
            </motion.div>

            <div className="hidden sm:block max-w-md truncate">
              <h1 className="truncate text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
                {fileDetails.name}
              </h1>
              {fileDetails.parentReference?.path && (
                <p className="mt-0.5 flex items-center truncate text-xs text-gray-500 dark:text-gray-400">
                  <Icons.Folder className="mr-1.5 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                  <span className="truncate">
                    {formatFilePath(fileDetails.parentReference.path) || "Root"}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex gap-3">
              <motion.button
                onClick={handleCopyLink}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isCopied
                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                } focus:ring-blue-500 dark:focus:ring-blue-400 gap-2 shadow-sm`}
                aria-label={isCopied ? t("copy.copied") : t("copy.copyLink")}
                title={isCopied ? t("copy.copied") : t("copy.copyLink")}
              >
                {isCopied ? t("copy.copied") : t("copy.copyLink")}
                {isCopied ? (
                  <Icons.Check className="h-4 w-4" />
                ) : (
                  <Icons.Link className="h-4 w-4" />
                )}
              </motion.button>

              <motion.a
                href={downloadUrl}
                download
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600 gap-2 shadow-sm"
                aria-label={t("common.download")}
                title={t("common.download")}
              >
                {t("common.download")}
                <Icons.Download className="h-4 w-4" />
              </motion.a>
            </div>
          </div>
        </div>
      </div>

      <div className="sm:hidden px-4 pb-3">
        <h1 className="truncate text-base font-semibold text-gray-900 dark:text-white">
          {fileDetails.name}
        </h1>
        {fileDetails.parentReference?.path && (
          <p className="mt-0.5 flex items-center truncate text-xs text-gray-500 dark:text-gray-400">
            <Icons.Folder className="mr-1.5 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
            <span className="truncate">
              {formatFilePath(fileDetails.parentReference.path) || "Root"}
            </span>
          </p>
        )}
      </div>
    </header>
  );
}
