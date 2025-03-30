import { Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { Icons } from "~/components/icons";
import { MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";

export const meta: MetaFunction = () => {
  return [
    { title: "Not Found | OneDrive Explorer" },
    {
      name: "description",
      content:
        "Sorry, we couldn't find the page you're looking for. Please check the URL or try again later.",
    },
  ];
};

export function loader() {
  return new Response("Not Found", { status: 404 });
}

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 dark:from-gray-950 dark:via-black dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <Icons.Warning className="h-12 w-12 text-gray-600 dark:text-gray-400" />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          {t("common.pageNotFound")}
        </h1>
        <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
          {t("common.pageNotFoundDescription")}
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Icons.Home className="mr-2 h-5 w-5" />
            {t("common.backToHome")}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
