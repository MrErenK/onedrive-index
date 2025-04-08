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
        className="relative border-t border-gray-200/70 bg-gradient-to-b from-gray-50/90 to-gray-100/90 py-10 backdrop-blur-md dark:from-gray-900/90 dark:to-black/90 dark:border-gray-800/70"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <span>
                © {year} {t("footer.copyright")}
              </span>
            </p>

            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
              <span>Made with</span>
              <Icons.Heart className="text-red-500 animate-pulse h-4 w-4" />
              <span>
                by{" "}
                <a
                  href="https://github.com/MrErenK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400 font-semibold"
                >
                  MrErenK
                </a>
              </span>
            </p>

            <div className="flex flex-col items-center justify-between space-y-8 md:flex-row md:space-y-0">
              <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                <Link
                  to="/files"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 flex items-center gap-2 group"
                >
                  <Icons.Folder className="h-4 w-4 transition-transform group-hover:scale-110" />
                  {t("common.files")}
                </Link>
                <a
                  href="https://github.com/MrErenK/onedrive-index"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 flex items-center gap-2 group"
                  aria-label="GitHub repository"
                >
                  <Icons.GitHub className="h-4 w-4 transition-transform group-hover:scale-110" />
                  <span>GitHub</span>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
