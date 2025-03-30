import { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { requireAuth } from "~/utils/auth.server";
import { formatFileSize } from "~/utils/format";
import { Icons } from "~/components/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { LoadingSpinner } from "~/components/loading-spinner";
import { copyToClipboard } from "~/utils/copy";
import { FilePreviewWrapper } from "~/components/file-previews/file-preview-wrapper";
import { createOneDriveService } from "~/services/onedrive.service";
import { useTranslation } from "react-i18next";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const fileName = data?.fileDetails?.name || "File";

  return [
    { title: `${fileName} | OneDrive Explorer` },
    { name: "description", content: `View file: ${fileName}` },
  ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { accessToken } = await requireAuth(request);
  const filePath = params.filePath;

  if (!filePath) {
    throw new Response("File path is required", { status: 400 });
  }

  try {
    const service = createOneDriveService(accessToken);

    // Try to get item by ID first (in case filePath is an ID)
    let fileDetails;
    try {
      fileDetails = await service.getItemById(filePath);
    } catch (error) {
      // If ID lookup fails, try by path
      try {
        fileDetails = await service.getItemByPath(decodeURIComponent(filePath));
      } catch (pathError) {
        console.error("Failed to get item by path:", pathError);
        throw new Response("File not found", { status: 404 });
      }
    }

    // Get download URL
    const downloadUrl = await service.getDownloadUrl(fileDetails.id);

    return Response.json({
      fileDetails,
      downloadUrl,
      accessToken,
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    throw new Response("Failed to fetch file information", { status: 500 });
  }
}

export default function FileViewer() {
  const { fileDetails, downloadUrl } = useLoaderData<typeof loader>();
  const [isCopied, setIsCopied] = useState(false);
  const { t } = useTranslation();

  const handleCopyLink = async () => {
    // Use the current URL structure but replace /view/ with /download/ to get download link
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

  const formatFilePath = (path?: string) => {
    if (!path) return "";
    return path
      .replace("/drive/root:", "")
      .split("/")
      .filter(Boolean)
      .join(" / ");
  };

  if (!fileDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur-lg backdrop-saturate-150 dark:border-gray-800 dark:bg-gray-900/90">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4 sm:items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
                  className="group flex items-center justify-center rounded-full bg-gray-100 p-2.5 text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                  aria-label="Back to files"
                >
                  <Icons.Back className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
                  <span className="ml-1.5 hidden text-sm font-medium sm:inline">
                    {t("common.back")}
                  </span>
                </Link>
              </motion.div>
              <div className="max-w-[80vw] sm:max-w-[50vw]">
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h1 className="truncate text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                      {fileDetails.name}
                    </h1>

                    {fileDetails.parentReference?.path && (
                      <p className="mt-0.5 flex items-center truncate text-sm text-gray-500 dark:text-gray-400">
                        <Icons.Folder className="mr-1.5 h-3.5 w-3.5" />
                        <span className="truncate">
                          {formatFilePath(fileDetails.parentReference.path) ||
                            "Root"}
                        </span>
                      </p>
                    )}

                    <p className="mt-1 flex items-center truncate text-sm text-gray-500 dark:text-gray-400">
                      {fileDetails.size && (
                        <>
                          <Icons.FileSize className="mr-1 h-3.5 w-3.5" />
                          <span className="mr-2">
                            {formatFileSize(fileDetails.size)}
                          </span>
                          <span className="mx-1.5 h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                        </>
                      )}
                      <Icons.Calendar className="mr-1 h-3.5 w-3.5" />
                      <span>
                        {t("fileView.modified")}{" "}
                        {fileDetails.lastModifiedDateTime &&
                          new Date(
                            fileDetails.lastModifiedDateTime
                          ).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                      </span>
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            {downloadUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="self-end sm:self-auto"
              >
                <div className="flex flex-col sm:flex-row gap-2">
                  <motion.button
                    onClick={handleCopyLink}
                    className="group flex items-center rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 shadow-md transition-all hover:bg-gray-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                  >
                    {isCopied ? (
                      <>
                        <Icons.Check className="mr-2 h-5 w-5" />
                        {t("copy.copied")}
                      </>
                    ) : (
                      <>
                        <Icons.Link className="mr-2 h-5 w-5" />
                        {t("copy.copyLink")}
                      </>
                    )}
                  </motion.button>
                  <motion.a
                    href={downloadUrl}
                    className="group flex items-center justify-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-black hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-500"
                    download
                  >
                    <Icons.Download className="mr-2 h-5 w-5 transition-transform group-hover:translate-y-0.5" />
                    {t("common.download")}
                  </motion.a>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-7xl"
        >
          <div className="mb-6 flex flex-wrap gap-2">
            <FileBadge
              icon={<Icons.FileType className="mr-1.5 h-3.5 w-3.5" />}
              label={t("fileView.type")}
              value={
                fileDetails.file?.mimeType?.split("/")[1]?.toUpperCase() ||
                "Folder"
              }
            />
            {fileDetails.size && (
              <FileBadge
                icon={<Icons.FileSize className="mr-1.5 h-3.5 w-3.5" />}
                label={t("fileView.size")}
                value={formatFileSize(fileDetails.size)}
              />
            )}
            <FileBadge
              icon={<Icons.Calendar className="mr-1.5 h-3.5 w-3.5" />}
              label={t("fileView.modified")}
              value={new Date(fileDetails.lastModifiedDateTime).toLocaleString(
                undefined,
                {
                  dateStyle: "medium",
                  timeStyle: "short",
                }
              )}
            />
          </div>

          <div className="relative overflow-hidden rounded-xl">
            <FilePreviewWrapper file={fileDetails} downloadUrl={downloadUrl} />
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function FileBadge({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center rounded-full bg-white px-4 py-1.5 text-sm shadow-sm ring-1 ring-gray-200 transition-all hover:shadow dark:bg-gray-800 dark:ring-gray-700">
      {icon}
      <span className="font-medium text-gray-700 dark:text-gray-300">
        {label}:
      </span>
      <span className="ml-1.5 text-gray-600 dark:text-gray-400">{value}</span>
    </div>
  );
}
