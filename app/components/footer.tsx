import { motion } from "framer-motion";
import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";

export function Footer() {
  const year = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <div className="relative mt-8">
      <div className="absolute inset-x-0 -top-16 h-16 bg-gradient-to-b from-transparent to-gray-50/80 dark:to-black/80 pointer-events-none" />

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative border-t border-gray-200/70 bg-gray-50/80 py-6 backdrop-blur-sm dark:border-gray-800/70 dark:bg-black/80"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm font-medium text-gray-600 transition-colors dark:text-gray-400">
              © {year} {t("footer.copyright")} {t("footer.allRightsReserved")}
            </p>

            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              <Link
                to="/files"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                {t("common.files")}
              </Link>
              <a
                href="https://github.com/MrErenK/onedrive-index"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
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
