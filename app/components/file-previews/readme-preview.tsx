import { motion } from "framer-motion";
import { Icons } from "../icons";
import ReactMarkdown from "react-markdown";
import { useCallback } from "react";

export function ReadmePreview({
  content,
  onClose,
}: {
  content: string;
  onClose: () => void;
}) {
  // Custom link renderer for markdown
  const CustomLink = useCallback(
    ({ href, children }: { href?: string; children: React.ReactNode }) => {
      // Only customize behavior for hash links
      if (href?.startsWith("#")) {
        return (
          <a
            href={href}
            onClick={(e) => {
              e.preventDefault();

              // Remove the # symbol to get the element ID
              const elementId = href.substring(1);
              const element = document.getElementById(elementId);

              if (element) {
                element.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });

                // Update URL without navigation
                window.history.pushState(null, "", href);
              }
            }}
          >
            {children}
          </a>
        );
      }

      // Regular links proceed normally
      return <a href={href}>{children}</a>;
    },
    []
  );

  // Custom heading renderer to add IDs for anchor links
  const CustomHeading = ({
    level,
    children,
  }: {
    level: number;
    children: React.ReactNode;
  }) => {
    // Convert heading content to a string and create an ID
    const text = children?.toString() || "";
    const id = text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

    return <HeadingTag id={id}>{children}</HeadingTag>;
  };

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
        <ReactMarkdown
          components={{
            a: ({ href, children }) => CustomLink({ href, children }),
            h1: ({ children }) => CustomHeading({ level: 1, children }),
            h2: ({ children }) => CustomHeading({ level: 2, children }),
            h3: ({ children }) => CustomHeading({ level: 3, children }),
            h4: ({ children }) => CustomHeading({ level: 4, children }),
            h5: ({ children }) => CustomHeading({ level: 5, children }),
            h6: ({ children }) => CustomHeading({ level: 6, children }),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}
