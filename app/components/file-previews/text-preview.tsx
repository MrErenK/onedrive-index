import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { LoadingSpinner } from "../loading-spinner";

interface TextPreviewProps {
  url: string;
  name: string;
}

export function TextPreview({ url }: TextPreviewProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTextContent() {
      try {
        const response = await fetch(url);
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError("Failed to load text content");
        console.error("Error loading text:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTextContent();
  }, [url]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-[85vh] overflow-auto rounded-xl border border-gray-200 bg-white/90 backdrop-blur-sm p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800/90"
    >
      {loading ? (
        <div className="flex h-full w-full items-center justify-center">
          <LoadingSpinner size="medium" />
        </div>
      ) : error ? (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <pre className="h-full w-full overflow-auto whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-4 text-sm text-gray-800 dark:bg-gray-900 dark:text-gray-200 font-mono">
          {content}
        </pre>
      )}
    </motion.div>
  );
}
