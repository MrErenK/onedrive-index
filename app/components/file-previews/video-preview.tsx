import { motion } from "framer-motion";

interface VideoPreviewProps {
  url: string;
  name: string;
  thumbnailUrl?: string;
}

export function VideoPreview({ url, thumbnailUrl }: VideoPreviewProps) {
  return (
    <div className="flex h-[85vh] items-center justify-center rounded-xl bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-5xl overflow-hidden rounded-xl shadow-2xl"
      >
        <video
          controls
          autoPlay
          className="aspect-video w-full rounded-xl bg-black"
          src={url}
          poster={thumbnailUrl}
        >
          Your browser does not support video playback.
        </video>
      </motion.div>
    </div>
  );
}
