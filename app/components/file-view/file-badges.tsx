import { Icons } from "../icons";
import { useTranslation } from "react-i18next";
import { formatFileSize } from "~/utils/format";

interface FileBadgeProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
}

export function FileBadges({ fileDetails }: { fileDetails: any }) {
  const { t } = useTranslation();

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <FileBadge
        icon={<Icons.FileType className="mr-1.5 h-3.5 w-3.5" />}
        label={t("fileView.type")}
        value={
          fileDetails.file?.mimeType?.split("/")[1]?.toUpperCase() || "Folder"
        }
      />
      {fileDetails.size && (
        <FileBadge
          icon={<Icons.FileSize className="mr-1.5 h-3.5 w-3.5" />}
          label={t("fileView.size")}
          value={formatFileSize(fileDetails.size)}
        />
      )}
      <FileBadge
        icon={<Icons.Calendar className="mr-1.5 h-3.5 w-3.5" />}
        label={t("fileView.modified")}
        value={new Date(fileDetails.lastModifiedDateTime).toLocaleString(
          undefined,
          {
            dateStyle: "medium",
            timeStyle: "short",
          }
        )}
      />
    </div>
  );
}

function FileBadge({ icon, label, value }: FileBadgeProps) {
  return (
    <div className="flex items-center rounded-full bg-white px-4 py-1.5 text-sm shadow-sm ring-1 ring-gray-200 transition-all hover:shadow dark:bg-gray-800 dark:ring-gray-700">
      {icon}
      <span className="font-medium text-gray-700 dark:text-gray-300">
        {label}:
      </span>
      <span className="ml-1.5 text-gray-600 dark:text-gray-400">{value}</span>
    </div>
  );
}
