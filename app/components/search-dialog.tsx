import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "./icons";
import { Link } from "@remix-run/react";
import { formatFileSize } from "~/utils/format";
import type { DriveItem } from "~/utils/onedrive.server";
import { LoadingSpinner } from "./loading-spinner";
import { useDebounce } from "~/hooks/useDebounce";
import { useTranslation } from "react-i18next";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => Promise<DriveItem[]>;
}

export function SearchDialog({ isOpen, onClose, onSearch }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms delay
  const [results, setResults] = useState<DriveItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on Escape
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Open on Ctrl+K or Cmd+K
      if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); // Prevent default browser behavior
        if (!isOpen) {
          onClose(); // This will actually open it since we're using it as a toggle
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setResults([]);
      setError(null);
    }
  }, [isOpen]);

  const formatPath = (path?: string) => {
    if (!path) return "";
    return path
      .replace("/drive/root:", "")
      .split("/")
      .filter(Boolean)
      .join(" > ");
  };

  useEffect(() => {
    async function performSearch() {
      if (debouncedSearchQuery.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        // Add expand=folder to get folder details
        const searchResults = await onSearch(debouncedSearchQuery);
        setResults(searchResults);
      } catch (err) {
        setError("Failed to search files. Please try again.");
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }

    performSearch();
  }, [debouncedSearchQuery, onSearch]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="fixed inset-x-0 top-[15vh] z-50 mx-auto max-w-2xl overflow-hidden rounded-2xl bg-white/90 backdrop-blur-md shadow-xl ring-1 ring-black/5 dark:bg-gray-800/90 dark:ring-white/10"
          >
            <div className="border-b border-gray-200/80 dark:border-gray-700/80">
              <div className="flex items-center px-4">
                <Icons.Search className="h-5 w-5 text-gray-500/90 dark:text-gray-400/90" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("header.searchPlaceholder")}
                  className="flex-1 bg-transparent px-4 py-4 text-gray-900 placeholder-gray-500/90 focus:outline-none focus:ring-0 dark:text-white dark:placeholder-gray-400/80"
                  autoFocus
                />
                <kbd className="hidden sm:flex items-center justify-center rounded-lg bg-gray-100/80 px-2 py-1 text-xs text-gray-500 dark:bg-gray-700/80 dark:text-gray-400 min-w-[28px]">
                  ESC
                </kbd>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="small" />
                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                    {t("common.searching")}
                  </span>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-sm text-red-500 dark:text-red-400">
                  {error}
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((file) => (
                    <Link
                      key={file.id}
                      to={
                        file.folder
                          ? `/files?folder=${file.id}`
                          : `/files/view/${file.id}`
                      }
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-100/80 dark:hover:bg-gray-700/50"
                    >
                      {file.folder ? (
                        <Icons.Folder className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                      ) : (
                        <Icons.File className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          {file.folder ? (
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                              {file.folder.childCount} items
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              {formatFileSize(file.size)}
                            </span>
                          )}
                          {file.parentReference?.path && (
                            <span className="truncate opacity-75">
                              {formatPath(file.parentReference.path)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : searchQuery.length > 0 ? (
                <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  {t("common.searchNoResults")}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  {t("common.startTyping")}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
