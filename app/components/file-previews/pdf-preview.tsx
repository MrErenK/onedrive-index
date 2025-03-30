import { motion } from "framer-motion";
import { Icons } from "../icons";

interface PDFPreviewProps {
  url: string;
  name: string;
}

export function PDFPreview({ url, name }: PDFPreviewProps) {
  return (
    <div className="h-[85vh] overflow-hidden rounded-xl shadow-lg">
      <motion.object
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        data={url}
        type="application/pdf"
        className="h-full w-full rounded-xl border-0"
        aria-label={`PDF preview of ${name}`}
      >
        <div className="flex h-full items-center justify-center bg-gray-50 p-8 text-center dark:bg-gray-800">
          <div>
            <Icons.Document className="mx-auto h-16 w-16 text-gray-400" />
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              Your browser does not support PDF viewing. Please download the
              file.
            </p>
          </div>
        </div>
      </motion.object>
    </div>
  );
}
