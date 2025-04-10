import { ActionFunctionArgs } from "@remix-run/node";
import { requireAuth } from "~/utils/auth.server";
import { verifyAdminPassword as verifyPassword } from "~/utils/password";

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Verify authorization header (password)
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const password = authHeader.slice(7);
    const isValidPassword = verifyPassword(password);
    if (!isValidPassword) {
      return Response.json({ error: "Invalid password" }, { status: 401 });
    }

    // Get the session and OneDrive service
    const { accessToken } = await requireAuth(request);

    // Get content length and file name from headers
    const contentLength = parseInt(
      request.headers.get("Content-Length") || "0",
      10
    );
    const fileName = request.headers.get("X-File-Name");
    const uploadPath = request.headers.get("X-Upload-Path") || "";

    if (!fileName || !contentLength) {
      return Response.json(
        { error: "Missing file name or content length" },
        { status: 400 }
      );
    }

    // Create upload session with OneDrive
    const normalizedPath = uploadPath.split("/").filter(Boolean).join("/");
    const uploadEndpoint = normalizedPath
      ? `https://graph.microsoft.com/v1.0/me/drive/root:/${normalizedPath}/${fileName}:/createUploadSession`
      : `https://graph.microsoft.com/v1.0/me/drive/root/children/${fileName}/createUploadSession`;

    const sessionResponse = await fetch(uploadEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "@microsoft.graph.conflictBehavior": "rename",
        fileSize: contentLength,
        name: fileName,
      }),
    });

    if (!sessionResponse.ok) {
      throw new Error("Failed to create upload session");
    }

    const { uploadUrl } = await sessionResponse.json();
    if (!uploadUrl) {
      throw new Error("No upload URL received");
    }

    // Stream the file directly to OneDrive in chunks
    const chunkSize = 10 * 1024 * 1024; // 10MB chunks
    let uploaded = 0;
    const reader = request.body?.getReader();

    if (!reader) {
      throw new Error("Request body is not readable");
    }

    while (uploaded < contentLength) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = value;
      const end = Math.min(uploaded + chunk.length, contentLength);

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Length": chunk.length.toString(),
          "Content-Range": `bytes ${uploaded}-${end - 1}/${contentLength}`,
        },
        body: chunk,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload chunk: ${uploadResponse.statusText}`);
      }

      uploaded += chunk.length;
    }

    return Response.json({
      success: true,
      message: `Successfully uploaded ${fileName}`,
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
