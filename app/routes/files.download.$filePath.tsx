import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { requireAuth } from "~/utils/auth.server";
import { createOneDriveService } from "~/services/onedrive.service";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { accessToken } = await requireAuth(request);
  const filePath = params.filePath;

  if (!filePath) {
    throw new Response("File path is required", { status: 400 });
  }

  try {
    const service = createOneDriveService(accessToken);
    const fileDetails = await service.getItemByPath(
      decodeURIComponent(filePath)
    );
    const downloadUrl = await service.getDownloadUrl(fileDetails.id);

    // Redirect to the download URL
    return redirect(downloadUrl);
  } catch (error) {
    console.error("Error getting download URL:", error);
    throw new Response("Failed to get download URL", { status: 500 });
  }
}
