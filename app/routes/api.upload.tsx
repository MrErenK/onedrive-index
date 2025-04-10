import { ActionFunctionArgs } from "@remix-run/node";
import { requireAuth, verifyPassword } from "~/utils/auth.server";
import { createOneDriveService } from "~/services/onedrive.service";

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Verify authorization header (password)
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const password = authHeader.slice(7); // Remove "Bearer " prefix
    const isValidPassword = await verifyPassword(password);
    if (!isValidPassword) {
      return Response.json({ error: "Invalid password" }, { status: 401 });
    }

    // Get the session and OneDrive service
    const { accessToken } = await requireAuth(request);
    const service = createOneDriveService(accessToken);

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const path = (formData.get("path") as string) || "";

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Normalize the path: remove leading/trailing slashes and empty segments
    const normalizedPath = path.split("/").filter(Boolean).join("/");

    // Upload the file
    await service.uploadFile(file, normalizedPath);

    return Response.json({
      success: true,
      message: `Successfully uploaded ${file.name}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
