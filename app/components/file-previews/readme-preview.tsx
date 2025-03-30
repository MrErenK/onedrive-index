import { motion } from "framer-motion";
import { Icons } from "../icons";
import ReactMarkdown from "react-markdown";

export function ReadmePreview({
  content,
  onClose,
}: {
  content: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <Icons.Document className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h3 className="ml-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            README.md
          </h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          aria-label="Close README preview"
        >
          <Icons.Close className="h-5 w-5" />
        </button>
      </div>
      <div className="prose max-w-none dark:prose-invert prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900 prose-pre:p-4 prose-pre:rounded-lg">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </motion.div>
  );
}
