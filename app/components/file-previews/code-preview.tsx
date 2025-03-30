import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { LoadingSpinner } from "../loading-spinner";
import { useTheme } from "../theme-provider";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import "highlight.js/styles/github-dark.css";

interface CodePreviewProps {
  url: string;
  name: string;
  language?: string;
}

export function CodePreview({ url, name, language }: CodePreviewProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const codeRef = useRef<HTMLElement>(null);

  // Detect language from file extension if not provided
  const detectLanguage = () => {
    if (language) return language;

    const ext = name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "js":
        return "javascript";
      case "jsx":
        return "jsx";
      case "ts":
        return "typescript";
      case "tsx":
        return "typescript";
      case "py":
        return "python";
      case "rb":
        return "ruby";
      case "java":
        return "java";
      case "php":
        return "php";
      case "go":
        return "go";
      case "rust":
        return "rust";
      case "c":
        return "c";
      case "cpp":
        return "cpp";
      case "cs":
        return "csharp";
      case "html":
        return "html";
      case "css":
        return "css";
      case "json":
        return "json";
      case "md":
        return "markdown";
      case "xml":
        return "xml";
      case "yaml":
      case "yml":
        return "yaml";
      case "sh":
      case "bash":
        return "bash";
      default:
        return "plaintext";
    }
  };

  useEffect(() => {
    async function fetchCodeContent() {
      try {
        const response = await fetch(url);
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError("Failed to load code content");
        console.error("Error loading code:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCodeContent();
  }, [url]);

  // Apply syntax highlighting after content is loaded
  useEffect(() => {
    if (content && codeRef.current) {
      const detectedLanguage = detectLanguage();
      if (detectedLanguage !== "plaintext") {
        codeRef.current.className = `language-${detectedLanguage}`;
      }
      hljs.highlightElement(codeRef.current);
    }
  }, [content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`h-[85vh] overflow-auto rounded-xl border ${
        theme === "dark"
          ? "border-gray-700 bg-gray-800/90"
          : "border-gray-200 bg-white/90"
      } backdrop-blur-sm shadow-lg`}
    >
      {loading ? (
        <div className="flex h-full w-full items-center justify-center">
          <LoadingSpinner size="medium" />
        </div>
      ) : error ? (
        <div className="flex h-full w-full items-center justify-center">
          <p
            className={`${theme === "dark" ? "text-red-400" : "text-red-500"}`}
          >
            {error}
          </p>
        </div>
      ) : (
        <div className="h-full w-full overflow-auto p-4">
          <pre className="m-0 h-full rounded-xl text-sm overflow-auto">
            <code
              ref={codeRef}
              className={`hljs ${theme === "dark" ? "hljs-dark" : ""}`}
            >
              {content || ""}
            </code>
          </pre>
        </div>
      )}
    </motion.div>
  );
}
