import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Form } from "@remix-run/react";
import { Icons } from "./icons";

export function LanguageSelector() {
  const { i18n } = useTranslation();

  return (
    <Form method="post" action="/set-locale" className="relative">
      <motion.select
        name="locale"
        onChange={(e) => e.target.form?.submit()}
        value={i18n.language}
        className="appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 pr-8 text-sm text-gray-700 shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <option value="en">English</option>
        <option value="tr">Türkçe</option>
      </motion.select>
      <Icons.ChevronDown className="h-4 w-4 fill-current absolute inset-y-0 right-0 flex items-center px-2 text-gray-500" />
    </Form>
  );
}
