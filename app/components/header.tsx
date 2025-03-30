import { Link } from "@remix-run/react";
import { ThemeToggle } from "./theme-toggle";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "./icons";
import { useState, useCallback } from "react";
import { SearchDialog } from "./search-dialog";
import type { DriveItem } from "~/utils/onedrive.server";
import { LanguageSelector } from "./language-selector";
import { useTranslation } from "react-i18next";

export function Header({
  user,
  onSearch,
  viewMode,
  setViewMode,
  scrolled,
}: {
  user: any;
  onSearch?: (query: string) => Promise<DriveItem[]>;
  viewMode?: "list" | "grid";
  setViewMode?: (mode: "list" | "grid") => void;
  scrolled: boolean;
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { t } = useTranslation();

  const handleSearch = useCallback(
    async (query: string) => {
      if (!onSearch) return [];
      return await onSearch(query);
    },
    [onSearch]
  );

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b border-gray-200 bg-white/85 backdrop-blur-md backdrop-saturate-150 shadow-sm dark:border-gray-800 dark:bg-black/90 transition-all duration-200 ${
          scrolled ? "py-2" : "py-3"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <h1
                className={`text-xl font-bold text-gray-900 dark:text-white transition-all duration-200 ${
                  scrolled ? "text-lg" : "text-xl"
                }`}
              >
                <Link
                  to="/files"
                  className="flex items-center hover:opacity-80 transition-opacity"
                  aria-label="Navigate to files"
                >
                  <Icons.Cloud
                    className={`mr-2.5 text-blue-600 dark:text-blue-400 transition-all duration-200 ${
                      scrolled ? "h-5 w-5" : "h-6 w-6"
                    }`}
                  />
                  <span className="tracking-tight">
                    {t("common.siteTitle")}
                  </span>
                </Link>
              </h1>
            </motion.div>

            <motion.div
              className="flex items-center gap-3 sm:gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <AnimatePresence>
                {scrolled && viewMode && setViewMode && (
                  <motion.div
                    key="header-view-toggle"
                    initial={{ opacity: 0, width: 0, overflow: "hidden" }}
                    animate={{ opacity: 1, width: "auto", overflow: "visible" }}
                    exit={{ opacity: 0, width: 0, overflow: "hidden" }}
                    transition={{ duration: 0.3 }}
                    className="hidden sm:flex items-center gap-2"
                  >
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "list"
                          ? "bg-gray-200 dark:bg-gray-700"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icons.List className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "grid"
                          ? "bg-gray-200 dark:bg-gray-700"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icons.Grid className="h-5 w-5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {onSearch && (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none"
                >
                  <Icons.Search className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">{t("common.search")}</span>
                  <kbd className="ml-2 hidden rounded border border-gray-300 px-1.5 py-0.5 text-xs font-medium text-gray-500 dark:border-gray-600 dark:text-gray-400 sm:inline-block">
                    {navigator.platform.toLowerCase().includes("mac")
                      ? "⌃K"
                      : "Ctrl+K"}
                  </kbd>
                </button>
              )}

              <div className="hidden items-center md:flex md:border-r md:border-gray-200 md:dark:border-gray-700 md:pr-4">
                <div className="relative group">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.displayName
                    )}&background=random&color=fff`}
                    alt={`${user.displayName}'s avatar`}
                    className={`mr-2.5 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-sm transition-all duration-200 ${
                      scrolled ? "h-7 w-7" : "h-8 w-8"
                    }`}
                  />
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                </div>
                <span
                  className={`font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 ${
                    scrolled ? "text-sm" : "text-base"
                  }`}
                >
                  {user.displayName}
                </span>
              </div>

              <ThemeToggle />
              <LanguageSelector />
            </motion.div>
          </div>
        </div>
      </header>

      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen((prev) => !prev)}
        onSearch={handleSearch}
      />
    </>
  );
}
