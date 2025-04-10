import { ActionFunctionArgs } from "@remix-run/node";
import { requireAuth } from "~/utils/auth.server";
import { createOneDriveService } from "~/services/onedrive.service";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { accessToken } = await requireAuth(request);
    const formData = await request.formData();

    const uploadType = formData.get("uploadType");
    const path = (formData.get("path") as string) || "";

    if (!uploadType) {
      return Response.json(
        { error: "Upload type is required" },
        { status: 400 }
      );
    }

    const service = createOneDriveService(accessToken);

    if (uploadType === "file") {
      const file = formData.get("file");
      if (!(file instanceof File)) {
        return Response.json({ error: "No file provided" }, { status: 400 });
      }

      await service.uploadFile(file, path);
      return Response.json({ success: true });
    } else if (uploadType === "url") {
      const url = formData.get("url") as string;
      if (!url) {
        return Response.json({ error: "No URL provided" }, { status: 400 });
      }
      await service.uploadFromUrl(url, path);
      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid upload type" }, { status: 400 });
  } catch (error) {
    console.error("Upload failed:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown upload error",
      },
      { status: 500 }
    );
  }
}
