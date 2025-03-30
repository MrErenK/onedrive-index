import { motion } from "framer-motion";
import { Icons } from "../icons";
import { formatFileSize } from "~/utils/format";

interface AudioPreviewProps {
  url: string;
  name: string;
  fileSize?: number;
}

export function AudioPreview({ url, name, fileSize }: AudioPreviewProps) {
  return (
    <div className="flex h-[85vh] items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl rounded-2xl bg-white/90 backdrop-blur-sm p-8 shadow-xl ring-1 ring-gray-200/50 dark:bg-gray-800/90 dark:ring-gray-700/50 dark:shadow-2xl"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner dark:from-gray-700 dark:to-gray-800/70">
            <Icons.AudioFile className="h-20 w-20 text-gray-500 dark:text-gray-300" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {name}
          </h3>
          {fileSize && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Audio file • {formatFileSize(fileSize)}
            </p>
          )}
        </div>
        <div className="rounded-xl bg-gray-50 p-4 shadow-inner dark:bg-gray-700/50">
          <audio
            controls
            className="w-full"
            src={url}
            style={{ height: "40px" }}
          >
            Your browser does not support audio playback.
          </audio>
        </div>
      </motion.div>
    </div>
  );
}
