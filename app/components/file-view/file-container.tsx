import { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAuth } from "~/utils/auth.server";
import { motion } from "framer-motion";
import { FilePreviewWrapper } from "~/components/file-previews/file-preview-wrapper";
import { createOneDriveService } from "~/services/onedrive.service";
import { FileHeader } from "~/components/file-view/file-header";
import { FileBadges } from "~/components/file-view/file-badges";
import { LoadingSpinner } from "../loading-spinner";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const fileName = data?.fileDetails?.name || "File";
  return [
    { title: `${fileName} | OneDrive Explorer` },
    { name: "description", content: `View file: ${fileName}` },
  ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { accessToken } = await requireAuth(request);
  const filePath = params.filePath;

  if (!filePath) {
    throw new Response("File path is required", { status: 400 });
  }

  try {
    const service = createOneDriveService(accessToken);

    // Try to get item by ID first (in case filePath is an ID)
    let fileDetails;
    try {
      fileDetails = await service.getItemById(filePath);
    } catch (error) {
      // If ID lookup fails, try by path
      try {
        fileDetails = await service.getItemByPath(decodeURIComponent(filePath));
      } catch (pathError) {
        console.error("Failed to get item by path:", pathError);
        throw new Response("File not found", { status: 404 });
      }
    }

    // Get download URL
    const downloadUrl = await service.getDownloadUrl(fileDetails.id);

    return Response.json({
      fileDetails,
      downloadUrl,
      accessToken,
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    throw new Response("Failed to fetch file information", { status: 500 });
  }
}

export default function FileViewer() {
  const { fileDetails, downloadUrl } = useLoaderData<typeof loader>();

  if (!fileDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black">
      <FileHeader fileDetails={fileDetails} downloadUrl={downloadUrl} />

      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-7xl"
        >
          <FileBadges fileDetails={fileDetails} />

          <div className="relative overflow-hidden rounded-xl">
            <FilePreviewWrapper file={fileDetails} downloadUrl={downloadUrl} />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
