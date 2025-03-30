import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { LoadingSpinner } from "../loading-spinner";
import ReactMarkdown from "react-markdown";

interface MarkdownPreviewProps {
  url: string;
  name: string;
}

export function MarkdownPreview({ url }: MarkdownPreviewProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMarkdownContent() {
      try {
        const response = await fetch(url);
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError("Failed to load markdown content");
        console.error("Error loading markdown:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMarkdownContent();
  }, [url]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-[85vh] overflow-auto rounded-xl border border-gray-200 bg-white/90 backdrop-blur-sm p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800/90"
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
        <article className="prose max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-lg prose-pre:bg-gray-50 dark:prose-pre:bg-gray-900 prose-pre:p-4 prose-pre:rounded-lg">
          <ReactMarkdown>{content || ""}</ReactMarkdown>
        </article>
      )}
    </motion.div>
  );
}
