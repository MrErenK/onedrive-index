import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "../icons";
import { useTranslation } from "react-i18next";
import type { DriveItem } from "~/utils/onedrive.server";
import { formatFileSize } from "~/utils/format";
import { DragDropZone } from "../drag-drop-zone";
import { usePasswordVerification } from "~/hooks/usePasswordVerification";
import { PasswordVerificationModal } from "../password-verification-modal";
import { createPortal } from "react-dom";

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  status: "queued" | "uploading" | "completed" | "error";
  error?: string;
  size: number;
  type: "file";
  path: string;
}

interface DragDropUploadProps {
  currentPath: string;
  onUpload: (file: File, path: string) => Promise<void>;
  onUrlUpload: (url: string, path: string) => Promise<void>;
  onFetchFolders: (path: string) => Promise<DriveItem[]>;
  onUploadComplete: () => void;
}

export function DragDropUpload({
  currentPath,
  onUpload,
  onUrlUpload,
  onFetchFolders,
  onUploadComplete,
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [url, setUrl] = useState("");
  const [uploadPath, setUploadPath] = useState(currentPath);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [showFolderSelect, setShowFolderSelect] = useState(false);
  const [folders, setFolders] = useState<DriveItem[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const { isVerified, isVerifying, error, verifyPassword } =
    usePasswordVerification();
  const { t } = useTranslation();

  // Fetch folders when path changes or folder select is opened
  useEffect(() => {
    if (showFolderSelect) {
      fetchFolders(uploadPath);
    }
  }, [showFolderSelect, uploadPath]);

  const fetchFolders = async (path: string) => {
    setIsLoadingFolders(true);
    try {
      const foldersList = await onFetchFolders(path); // Call the function passed as prop
      setFolders(foldersList.filter((item) => item.folder)); // Only show folders
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const queueFiles = (files: File[]) => {
    const newFiles: UploadingFile[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      progress: 0,
      status: "queued",
      size: file.size,
      type: "file",
      path: uploadPath,
    }));

    setUploadingFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!isVerified) {
      setPendingFiles(files);
      setShowPasswordModal(true);
      return;
    }
    handleFiles(files); // Use a separate function to handle files
  };

  const handleFiles = (files: File[]) => {
    const newFiles: UploadingFile[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      progress: 0,
      status: "queued",
      size: file.size,
      type: "file",
      path: uploadPath,
    }));

    setUploadingFiles((prev) => [...prev, ...newFiles]);

    // Start upload automatically
    newFiles.forEach(async (file) => {
      await startUpload(file.id, files);
    });
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (!isVerified) {
        setPendingFiles(files);
        setShowPasswordModal(true);
        return;
      }
      queueFiles(files);
    },
    [isVerified]
  );

  const handlePasswordVerify = async (password: string) => {
    const success = await verifyPassword(password);
    if (success && pendingFiles.length > 0) {
      handleFiles(pendingFiles);
      setPendingFiles([]);
    }
    return success;
  };

  const startUpload = async (fileId: string, originalFiles?: File[]) => {
    const fileToUpload = uploadingFiles.find((f) => f.id === fileId);
    if (!fileToUpload || fileToUpload.status === "uploading") return;

    // Find the original file either from input or passed files
    const originalFile = originalFiles
      ? originalFiles.find((f) => f.name === fileToUpload.name)
      : Array.from(fileInputRef.current?.files || []).find(
          (f) => f.name === fileToUpload.name
        );

    if (!originalFile) return;

    setUploadingFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, status: "uploading" } : f))
    );

    try {
      await onUpload(originalFile, fileToUpload.path);

      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, progress: 100, status: "completed" } : f
        )
      );

      // Call onUploadComplete after successful upload
      onUploadComplete?.();

      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId));
      }, 3000);
    } catch (error) {
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f
        )
      );
    }
  };

  const handleCancelUpload = (fileId: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleUrlUploadClick = () => {
    setShowUrlInput(true);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;

    try {
      await onUrlUpload(urlInput, uploadPath);
      setUrlInput("");
      setShowUrlInput(false);
    } catch (error) {
      console.error("URL upload failed:", error);
    }
  };

  return (
    <div className="relative space-y-6 mb-6">
      {/* Destination Path Selection */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("upload.destination")}
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={uploadPath}
            onChange={(e) => setUploadPath(e.target.value)}
            className="flex-1 block rounded-lg border border-gray-300 bg-white/50 px-4 py-2.5 text-gray-900 shadow-sm backdrop-blur-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
            placeholder={t("upload.pathPlaceholder")}
          />
          <button
            onClick={() => setShowFolderSelect((prev) => !prev)}
            className="inline-flex items-center rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors shadow-sm dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Icons.Folder className="mr-2 h-4 w-4" />
            Browse
          </button>
        </div>

        {/* Folder Selection Dialog */}
        <AnimatePresence>
          {showFolderSelect && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-[1000] mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Select Destination
                  </h3>
                  <button
                    onClick={() => setShowFolderSelect(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Icons.Close className="h-5 w-5" />
                  </button>
                </div>

                {/* Folder Navigation */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => {
                        const parentPath = uploadPath
                          .split("/")
                          .slice(0, -1)
                          .join("/");
                        setUploadPath(parentPath);
                        fetchFolders(parentPath);
                      }}
                      className="inline-flex items-center rounded-lg bg-gray-100 px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <Icons.Back className="mr-1.5 h-4 w-4" />
                      Up
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-md">
                      {uploadPath || "/"}
                    </span>
                  </div>
                </div>

                {/* Folder List */}
                <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20">
                  {isLoadingFolders ? (
                    <div className="flex items-center justify-center py-6">
                      <Icons.Spinner className="h-7 w-7 animate-spin text-blue-500 dark:text-blue-400" />
                    </div>
                  ) : folders.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-6 italic">
                      No folders found
                    </p>
                  ) : (
                    <div className="p-1">
                      {folders.map((folder) => (
                        <button
                          key={folder.id}
                          onClick={() => {
                            setUploadPath(
                              `${uploadPath}/${folder.name}`.replace(
                                /\/+/g,
                                "/"
                              )
                            );
                            fetchFolders(`${uploadPath}/${folder.name}`);
                          }}
                          className="w-full flex items-center rounded-md px-3.5 py-2.5 hover:bg-white dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 mb-1"
                        >
                          <Icons.Folder className="mr-2.5 h-5 w-5 text-amber-500 dark:text-amber-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                            {folder.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drop Zone */}
      <DragDropZone
        isDragging={isDragging}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        onUrlUploadClick={handleUrlUploadClick}
      />

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* File List */}
      <div className="space-y-3">
        {uploadingFiles.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white/60 backdrop-blur-sm p-4 shadow-sm transition-colors hover:bg-gray-50/70 dark:border-gray-700 dark:bg-gray-800/60 dark:hover:bg-gray-700/70"
          >
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700/70 shadow-sm">
                <Icons.File className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-0.5">
                  {file.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/70 px-2 py-0.5 rounded-full inline-block">
                  {formatFileSize(file.size)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {file.status === "queued" && (
                <motion.button
                  onClick={() => startUpload(file.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center rounded-lg bg-blue-500 px-4 py-2 text-xs font-medium text-white hover:bg-blue-600 transition-colors shadow-sm dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <Icons.Upload className="mr-1.5 h-3.5 w-3.5" />
                  {t("upload.upload")}
                </motion.button>
              )}
              {file.status === "uploading" && (
                <div className="flex items-center space-x-2 bg-blue-100/80 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg">
                  <Icons.Spinner className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    Uploading...
                  </span>
                </div>
              )}
              {file.status === "completed" && (
                <div className="flex items-center space-x-2 rounded-lg bg-green-100/80 px-3 py-1.5 dark:bg-green-900/30">
                  <Icons.Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">
                    Complete
                  </span>
                </div>
              )}
              {file.status === "error" && (
                <div className="flex items-center space-x-2 rounded-lg bg-red-100/80 px-3 py-1.5 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  <Icons.Error className="h-5 w-5" />
                  <span className="text-xs font-medium">{file.error}</span>
                </div>
              )}
              {file.status === "queued" && (
                <button
                  onClick={() => handleCancelUpload(file.id)}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  aria-label="Cancel upload"
                >
                  <Icons.Close className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* URL Upload Form */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleUrlSubmit}
            className="mt-4 space-y-3 bg-gray-50/70 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700 shadow-sm backdrop-blur-sm"
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("upload.urlUploadTitle") || "URL Upload"}
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={t("upload.urlPlaceholder")}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-colors dark:border-gray-700 dark:bg-gray-800/80 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                required
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-colors dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                <Icons.Link className="mr-2 h-4 w-4" />
                {t("upload.uploadUrl")}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Password Modal */}
      {typeof document !== "undefined" &&
        createPortal(
          <PasswordVerificationModal
            isOpen={showPasswordModal}
            onClose={() => {
              setShowPasswordModal(false);
              setPendingFiles([]);
            }}
            onVerify={handlePasswordVerify}
            isVerifying={isVerifying}
            error={error}
          />,
          document.body
        )}
    </div>
  );
}
