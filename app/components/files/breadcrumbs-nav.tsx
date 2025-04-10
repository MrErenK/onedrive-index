import { Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { Icons } from "../icons";
import { useTranslation } from "react-i18next";

export function BreadcrumbsNav({
  breadcrumbs,
}: {
  breadcrumbs: Array<{ path: string; name: string; id: string }>;
}) {
  const { t } = useTranslation();

  return (
    <motion.div
      className="mb-6 overflow-hidden rounded-xl bg-white/75 backdrop-blur-md shadow-lg border border-gray-100 dark:border-gray-800/60 dark:bg-gray-900/50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="overflow-x-auto py-3 px-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <ol className="flex flex-nowrap items-center whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-300">
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <Icons.ArrowRight className="mx-2.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
              )}
              {index < breadcrumbs.length - 1 ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-lg px-3 py-1.5 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm"
                >
                  <Link
                    to={
                      crumb.id === "root"
                        ? "/files"
                        : `/files?folder=${encodeURIComponent(crumb.path)}`
                    }
                    className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center font-medium"
                  >
                    {crumb.id === "root" ? (
                      <span className="flex items-center">
                        <Icons.Home className="mr-1.5 h-4 w-4 text-blue-500 dark:text-blue-400" />
                        {t("common.home")}
                      </span>
                    ) : (
                      crumb.name
                    )}
                  </Link>
                </motion.div>
              ) : (
                <span className="rounded-lg bg-blue-50 px-3.5 py-1.5 font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 shadow-sm">
                  {crumb.id === "root" ? (
                    <span className="flex items-center">
                      <Icons.Home className="mr-1.5 h-4 w-4 text-blue-500 dark:text-blue-400" />
                      {t("common.home")}
                    </span>
                  ) : (
                    crumb.name
                  )}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </motion.div>
  );
}
