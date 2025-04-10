import { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAuth } from "~/utils/auth.server";
import { createOneDriveService } from "~/services/onedrive.service";
import { LoadingSpinner } from "~/components/loading-spinner";
import { FilePreviewWrapper } from "~/components/file-previews/file-preview-wrapper";
import { motion } from "framer-motion";
import { FileViewHeader } from "~/components/file-view/file-view-header";
import { FileInfoPanel } from "~/components/file-view/file-info-panel";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const fileName = data?.fileDetails?.name || "File";
  return [
    { title: `${fileName} | OneDrive Explorer` },
    { name: "description", content: `View file: ${fileName}` },
  ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { accessToken, user } = await requireAuth(request);
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
      user,
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    throw new Response("Failed to fetch file information", { status: 500 });
  }
}

export default function FileViewer() {
  const { fileDetails, downloadUrl, user } = useLoaderData<typeof loader>();

  if (!fileDetails) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <LoadingSpinner size="large" />
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
            Loading file viewer...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black">
      <FileViewHeader
        user={user}
        fileDetails={fileDetails}
        downloadUrl={downloadUrl}
      />

      <main className="flex-1 container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-9 order-2 lg:order-1"
          >
            <div className="h-full rounded-xl bg-white/40 backdrop-blur-sm p-1 shadow-lg dark:bg-gray-900/40 border border-gray-200/50 dark:border-gray-700/50">
              <div className="h-[calc(100vh-13rem)] overflow-hidden">
                <FilePreviewWrapper
                  file={fileDetails}
                  downloadUrl={downloadUrl}
                />
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3 order-1 lg:order-2"
          >
            <div className="sticky top-24">
              <FileInfoPanel fileDetails={fileDetails} />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
