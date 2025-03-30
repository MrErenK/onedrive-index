import { motion } from "framer-motion";
import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";

export function Footer() {
  const year = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent to-white dark:to-black pointer-events-none transform -translate-y-full"></div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="border-t border-gray-200/70 bg-white py-8 shadow-inner dark:border-gray-800/70 dark:bg-black"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:gap-4">
            <p className="text-sm font-medium text-gray-700 transition-colors dark:text-gray-300">
              © {year} {t("footer.copyright")} {t("footer.allRightsReserved")}
            </p>

            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              <Link
                to="/files"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              >
                {t("common.files")}
              </Link>
              <a
                href="https://github.com/MrErenK/onedrive-index"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                aria-label="GitHub repository"
              >
                GitHub
              </a>
            </nav>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
