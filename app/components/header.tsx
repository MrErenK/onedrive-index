import { Link } from "@remix-run/react";
import { ThemeToggle } from "./theme-toggle";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "./icons";
import { useState, useCallback, useEffect } from "react";
import { SearchDialog } from "./search-dialog";
import type { DriveItem } from "~/utils/onedrive.server";
import { LanguageSelector } from "./language-selector";
import { useTranslation } from "react-i18next";

export function Header({
  user,
  onSearch,
  scrolled,
}: {
  user: any;
  onSearch?: (query: string) => Promise<DriveItem[]>;
  scrolled: boolean;
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [stableScrolled, setStableScrolled] = useState(scrolled);
  const { t } = useTranslation();

  // Add debounced scroll handling
  useEffect(() => {
    // Add a delay to ensure the scrolled state doesn't flicker
    const timer = setTimeout(() => {
      setStableScrolled(scrolled);
    }, 50); // Small delay to stabilize transitions

    return () => clearTimeout(timer);
  }, [scrolled]);

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
        className={`sticky top-0 z-50 border-b backdrop-blur-md backdrop-saturate-150 transition-all duration-300 ease-in-out
          ${
            stableScrolled
              ? "border-gray-200/80 bg-white/90 dark:border-gray-800/80 dark:bg-gray-900/90 shadow-sm py-2"
              : "border-transparent bg-white/50 dark:bg-gray-900/50 py-3"
          }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                to="/files"
                className="group flex items-center gap-2.5 hover:opacity-90 transition-all"
                aria-label="Navigate to files"
              >
                <div className="relative">
                  <Icons.Cloud
                    className={`text-blue-600 dark:text-blue-400 transition-all duration-300
                      ${stableScrolled ? "h-6 w-6" : "h-7 w-7"}`}
                  />
                  <motion.div
                    className="absolute -inset-2 rounded-full bg-blue-100 dark:bg-blue-900/30 z-[-1] opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{ scale: [0.95, 1.05, 0.95] }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: "easeInOut",
                    }}
                  />
                </div>
                <h1
                  className={`font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-300 tracking-tight transition-all duration-300
                    ${stableScrolled ? "text-lg" : "text-xl"}`}
                >
                  {t("common.siteTitle")}
                </h1>
              </Link>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              {onSearch && (
                <motion.button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-3 py-2 text-sm text-gray-700 transition-colors dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icons.Search className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">{t("common.search")}</span>
                  <kbd className="ml-2 hidden rounded border border-gray-300 px-1.5 py-0.5 text-xs font-medium text-gray-500 dark:border-gray-600 dark:text-gray-400 sm:inline-block">
                    {navigator.platform.toLowerCase().includes("mac")
                      ? "⌃K"
                      : "Ctrl+K"}
                  </kbd>
                </motion.button>
              )}

              <div className="flex items-center gap-3">
                <div
                  className={`relative hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/70 transition-all duration-300
                    ${stableScrolled ? "" : "shadow-sm"}`}
                >
                  <div className="relative">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.displayName
                      )}&background=random&color=fff`}
                      alt={`${user.displayName}'s avatar`}
                      className={`rounded-full ring-2 ring-white dark:ring-gray-800 transition-all duration-300
                        ${stableScrolled ? "h-7 w-7" : "h-8 w-8"}`}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                  </div>
                  <span
                    className={`font-medium text-gray-800 dark:text-gray-200 transition-all duration-300
                      ${stableScrolled ? "text-sm" : "text-base"}`}
                  >
                    {user.displayName}
                  </span>
                </div>

                <div className="hidden md:flex items-center">
                  <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1" />
                </div>

                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <LanguageSelector />
                </div>
              </div>
            </div>
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
