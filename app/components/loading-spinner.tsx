import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  className?: string;
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary" | "success" | "error" | "light";
  thickness?: "thin" | "normal" | "thick";
}

export function LoadingSpinner({
  className = "",
  size = "medium",
  color = "primary",
  thickness = "normal",
}: LoadingSpinnerProps) {
  const sizeClassMap = {
    small: "h-4 w-4 md:h-5 md:w-5",
    medium: "h-6 w-6 md:h-8 md:w-8",
    large: "h-10 w-10 md:h-12 md:w-12",
  };

  const colorClassMap = {
    primary: "border-blue-600 border-t-transparent",
    secondary: "border-purple-600 border-t-transparent",
    success: "border-green-500 border-t-transparent",
    error: "border-red-500 border-t-transparent",
    light: "border-gray-200 border-t-transparent dark:border-gray-700",
  };

  const thicknessClassMap = {
    thin: "border",
    normal: "border-2",
    thick: "border-4",
  };

  const sizeClass = sizeClassMap[size];
  const colorClass = colorClassMap[color];
  const thicknessClass = thicknessClassMap[thickness];

  return (
    <div className="flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          rotate: 360,
        }}
        transition={{
          opacity: { duration: 0.2 },
          rotate: { duration: 1, ease: "linear", repeat: Infinity },
        }}
        className={`${thicknessClass} ${colorClass} rounded-full ${sizeClass} shadow-sm ${className}`}
        aria-label="Loading"
      />
    </div>
  );
}
