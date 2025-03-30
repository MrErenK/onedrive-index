import { motion } from "framer-motion";

interface ImagePreviewProps {
  url: string;
  name: string;
}

export function ImagePreview({ url, name }: ImagePreviewProps) {
  return (
    <div className="flex h-[85vh] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-inner dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-950">
      <motion.img
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        src={url}
        alt={name}
        className="max-h-full max-w-full object-contain shadow-2xl sm:max-h-[90%] sm:max-w-[90%]"
        style={{
          filter: "drop-shadow(0 20px 25px rgba(0, 0, 0, 0.15))",
        }}
      />
    </div>
  );
}
