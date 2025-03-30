export function LoadingBar() {
  return (
    <div className="fixed left-0 right-0 top-0 z-50 transition-opacity duration-300 ease-in-out">
      <div className="h-1.5 sm:h-2 w-full overflow-hidden bg-gradient-to-r from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-700 shadow-sm">
        <div
          className="h-full w-[30%] animate-loading-progress rounded-r-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 shadow-inner"
          style={{
            backgroundSize: "200% 100%",
            animation:
              "loadingProgress 2s ease-in-out infinite, shimmer 2.5s linear infinite",
          }}
        ></div>
      </div>
    </div>
  );
}
