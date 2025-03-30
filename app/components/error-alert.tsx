import { Icons } from "./icons";
import { useEffect, useState } from "react";

export function ErrorAlert({ message }: { message: string }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setIsVisible(false), 10000); // Auto-hide after 10s
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div
      className={`mb-5 rounded-lg border border-red-200 bg-red-50 p-4 shadow-md transition-all duration-300 ease-in-out dark:border-red-800 dark:bg-red-900/30 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-1 pointer-events-none"
      } max-w-screen-lg mx-auto`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
        <div className="flex-shrink-0 flex items-center justify-center">
          <Icons.Error
            className="h-5 w-5 text-red-600 dark:text-red-400"
            aria-hidden="true"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm md:text-base text-red-800 dark:text-red-200 break-words">
            {message}
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-auto inline-flex rounded-md bg-red-100 p-1.5 text-red-600 hover:bg-red-200 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-800/80 transition-colors"
          aria-label="Dismiss"
          type="button"
        >
          <Icons.Close className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
