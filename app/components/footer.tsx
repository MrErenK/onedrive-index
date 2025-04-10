import { motion } from "framer-motion";
import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Icons } from "./icons";

export function Footer() {
  const year = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <div className="relative mt-16">
      <div className="absolute inset-x-0 -top-24 h-24 bg-gradient-to-b from-transparent to-gray-50/80 dark:to-gray-900/80 pointer-events-none" />

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative border-t border-gray-200/70 bg-gradient-to-b from-gray-50/95 to-gray-100/95 py-12 backdrop-blur-md dark:from-gray-900/95 dark:to-black/95 dark:border-gray-800/70 shadow-sm"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center">
              <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                © {year} {t("footer.copyright")}
              </span>
            </p>

            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2 bg-gray-100/50 dark:bg-gray-800/50 px-4 py-2 rounded-full shadow-inner">
              <span>Made with</span>
              <Icons.Heart className="text-red-500 animate-pulse h-4 w-4" />
              <span>
                by{" "}
                <a
                  href="https://github.com/MrErenK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors"
                >
                  MrErenK
                </a>
              </span>
            </p>

            <div className="flex items-center justify-center">
              <nav className="flex flex-wrap justify-center gap-x-6 gap-y-4 bg-white/40 dark:bg-gray-800/40 px-6 py-2.5 rounded-lg shadow-sm backdrop-blur-sm">
                <Link
                  to="/files"
                  className="text-sm font-medium text-gray-700 transition-all hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 flex items-center gap-2 group relative"
                >
                  <Icons.Folder className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:rotate-3" />
                  {t("common.files")}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <a
                  href="https://github.com/MrErenK/onedrive-index"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-700 transition-all hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 flex items-center gap-2 group relative"
                  aria-label="GitHub repository"
                >
                  <Icons.GitHub className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:rotate-3" />
                  <span>GitHub</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
