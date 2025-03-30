import { useMemo } from "react";
import { motion } from "framer-motion";
import { Icons } from "../icons";
import { ImagePreview } from "./image-preview";
import { PDFPreview } from "./pdf-preview";
import { TextPreview } from "./text-preview";
import { VideoPreview } from "./video-preview";
import { AudioPreview } from "./audio-preview";
import { CodePreview } from "./code-preview";
import { MarkdownPreview } from "./markdown-preview";
import { OfficePreview } from "./office-preview";
import { useTranslation } from "react-i18next";

interface FilePreviewWrapperProps {
  file: any;
  downloadUrl: string;
}

export function FilePreviewWrapper({
  file,
  downloadUrl,
}: FilePreviewWrapperProps) {
  const mimeType = file?.file?.mimeType || "";
  const fileName = file?.name || "File";
  const fileSize = file?.size;
  const thumbnailUrl = file?.thumbnails?.[0]?.large?.url;

  // Determine the appropriate preview component based on file type
  const PreviewComponent = useMemo(() => {
    // Images
    if (mimeType.startsWith("image/")) {
      return <ImagePreview url={downloadUrl} name={fileName} />;
    }

    // PDF
    if (mimeType === "application/pdf") {
      return <PDFPreview url={downloadUrl} name={fileName} />;
    }

    // Videos
    if (mimeType.startsWith("video/")) {
      return (
        <VideoPreview
          url={downloadUrl}
          name={fileName}
          thumbnailUrl={thumbnailUrl}
        />
      );
    }

    // Audio
    if (mimeType.startsWith("audio/")) {
      return (
        <AudioPreview url={downloadUrl} name={fileName} fileSize={fileSize} />
      );
    }

    // Markdown
    if (
      mimeType === "text/markdown" ||
      fileName.toLowerCase().endsWith(".md")
    ) {
      return <MarkdownPreview url={downloadUrl} name={fileName} />;
    }

    // Code files
    const codeExtensions = [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".py",
      ".rb",
      ".java",
      ".c",
      ".cpp",
      ".cs",
      ".go",
      ".php",
      ".sh",
      ".bash",
      ".json",
      ".yml",
      ".yaml",
      ".xml",
      ".html",
      ".css",
      ".scss",
      ".less",
    ];
    if (
      mimeType.startsWith("text/") ||
      codeExtensions.some((ext) => fileName.toLowerCase().endsWith(ext))
    ) {
      return <CodePreview url={downloadUrl} name={fileName} />;
    }

    // Office documents
    if (
      mimeType.includes("wordprocessingml") ||
      mimeType.includes("officedocument.word") ||
      fileName.endsWith(".docx") ||
      fileName.endsWith(".doc")
    ) {
      return (
        <OfficePreview url={downloadUrl} name={fileName} fileType="word" />
      );
    }

    if (
      mimeType.includes("spreadsheetml") ||
      mimeType.includes("officedocument.excel") ||
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls")
    ) {
      return (
        <OfficePreview url={downloadUrl} name={fileName} fileType="excel" />
      );
    }

    if (
      mimeType.includes("presentationml") ||
      mimeType.includes("officedocument.powerpoint") ||
      fileName.endsWith(".pptx") ||
      fileName.endsWith(".ppt")
    ) {
      return (
        <OfficePreview
          url={downloadUrl}
          name={fileName}
          fileType="powerpoint"
        />
      );
    }

    // Plain text
    if (mimeType.startsWith("text/")) {
      return <TextPreview url={downloadUrl} name={fileName} />;
    }

    // No preview available
    return (
      <NonViewableFileMessage fileName={fileName} downloadUrl={downloadUrl} />
    );
  }, [mimeType, fileName, downloadUrl, fileSize, thumbnailUrl]);

  return PreviewComponent;
}

function NonViewableFileMessage({
  fileName,
  downloadUrl,
}: {
  fileName: string;
  downloadUrl: string;
}) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 rounded-xl border border-gray-200 bg-white p-12 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
        <Icons.GenericFile className="h-14 w-14 text-gray-500 dark:text-gray-400" />
      </div>
      <h3 className="mt-6 text-2xl font-semibold text-gray-800 dark:text-white">
        {t("fileView.notAvailable")}
      </h3>
      <p className="mt-3 text-gray-600 dark:text-gray-300">
        <span className="font-medium">
          {fileName} {t("fileView.cannotPreview")}
        </span>
      </p>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          <a
            href={downloadUrl}
            className="group inline-flex items-center rounded-lg bg-gray-900 px-6 py-3 text-base font-medium text-white shadow-md transition-all hover:bg-black hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-500"
            download
          >
            <Icons.Download className="mr-3 h-5 w-5 transition-transform group-hover:translate-y-0.5" />
            {t("fileView.downloadFileButton")}
          </a>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
