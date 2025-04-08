import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Form } from "@remix-run/react";
import { Icons } from "./icons";

export function LanguageSelector() {
  const { i18n } = useTranslation();

  return (
    <Form method="post" action="/set-locale" className="relative">
      <div className="relative">
        <motion.select
          name="locale"
          onChange={(e) => e.target.form?.submit()}
          value={i18n.language}
          className="appearance-none rounded-xl border border-gray-200/60 bg-white/60 pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 shadow-sm backdrop-blur-sm transition-all hover:border-gray-300/80 hover:bg-gray-50/80 hover:text-blue-600 dark:border-gray-700/60 dark:bg-gray-800/60 dark:text-gray-300 dark:hover:border-gray-600/80 dark:hover:bg-gray-700/80 dark:hover:text-blue-400"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <option value="en" className="bg-white dark:bg-gray-800">
            English
          </option>
          <option value="tr" className="bg-white dark:bg-gray-800">
            Türkçe
          </option>
        </motion.select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <Icons.ChevronDown className="h-4 w-4 text-gray-500 transition-colors dark:text-gray-400" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-gray-100/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:via-gray-600/30 rounded-xl" />
      </div>
    </Form>
  );
}
