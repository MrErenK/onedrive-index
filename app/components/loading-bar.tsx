export function LoadingBar() {
  return (
    <div className="fixed left-0 right-0 top-0 z-50">
      <div className="h-1 w-full overflow-hidden bg-gradient-to-r from-gray-100/20 to-gray-200/20 dark:from-gray-800/20 dark:to-gray-900/20 backdrop-blur-sm">
        <div
          className="h-full animate-loading-progress bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
          style={{
            width: "30%",
            backgroundSize: "200% 100%",
            animation:
              "loading-progress 2s ease-in-out infinite, shimmer 2s linear infinite",
          }}
        />
      </div>
    </div>
  );
}
