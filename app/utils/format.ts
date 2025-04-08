export function formatFileSize(bytes?: number): string {
  if (bytes === undefined) return "Unknown";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function formatFilePath(path?: string) {
  if (!path) return "";
  return path
    .replace("/drive/root:", "")
    .split("/")
    .filter(Boolean)
    .join(" / ");
}
