import { Icons } from "./icons";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ErrorAlert({ message }: { message: string }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setIsVisible(false), 10000);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : -20,
      }}
      transition={{ duration: 0.3 }}
      className={`mb-5 rounded-xl border border-red-200/80 bg-red-50/90 backdrop-blur-sm p-4 shadow-lg transition-all duration-300 ease-in-out dark:border-red-800/50 dark:bg-red-900/20 ${
        !isVisible && "pointer-events-none"
      } max-w-screen-lg mx-auto`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Icons.Error
              className="h-5 w-5 text-red-600/90 dark:text-red-400/90"
              aria-hidden="true"
            />
          </motion.div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-800/90 dark:text-red-200/90">
            {message}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsVisible(false)}
          className="ml-auto rounded-lg bg-red-100/80 p-1.5 text-red-600/90 transition-colors hover:bg-red-200/80 hover:text-red-700 dark:bg-red-900/30 dark:text-red-400/90 dark:hover:bg-red-800/50"
          aria-label="Dismiss"
          type="button"
        >
          <Icons.Close className="h-4 w-4" aria-hidden="true" />
        </motion.button>
      </div>
    </motion.div>
  );
}
