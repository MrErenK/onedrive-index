import { motion } from "framer-motion";
import { Icons } from "../icons";

interface OfficePreviewProps {
  url: string;
  name: string;
  fileType: "word" | "excel" | "powerpoint";
}

export function OfficePreview({ url, name, fileType }: OfficePreviewProps) {
  // Microsoft Office Online Viewer URLs
  const getOfficeViewerUrl = () => {
    // URL encode the actual file URL
    const encodedUrl = encodeURIComponent(url);

    switch (fileType) {
      case "word":
        return `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`;
      case "excel":
        return `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`;
      case "powerpoint":
        return `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`;
      default:
        return `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`;
    }
  };

  const getOfficeIcon = () => {
    switch (fileType) {
      case "word":
        return <Icons.Document className="h-16 w-16 text-blue-600" />;
      case "excel":
        return <Icons.Document className="h-16 w-16 text-green-600" />;
      case "powerpoint":
        return <Icons.Document className="h-16 w-16 text-orange-600" />;
      default:
        return <Icons.Document className="h-16 w-16 text-gray-600" />;
    }
  };

  return (
    <div className="h-[85vh] overflow-hidden rounded-xl shadow-lg">
      <motion.iframe
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        src={getOfficeViewerUrl()}
        className="h-full w-full rounded-xl border-0"
        title={`${name} preview`}
        sandbox="allow-scripts allow-same-origin allow-forms"
        onError={() => {
          // Handle error if iframe fails to load
          console.error("Failed to load Office preview");
        }}
      >
        <div className="flex h-full items-center justify-center bg-gray-50 p-8 text-center dark:bg-gray-800">
          <div>
            {getOfficeIcon()}
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              Your browser cannot display this document. Please download the
              file.
            </p>
          </div>
        </div>
      </motion.iframe>
    </div>
  );
}
