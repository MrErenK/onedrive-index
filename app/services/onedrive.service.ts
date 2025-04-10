import type { DriveItem } from "~/utils/onedrive.server";

export interface OneDriveOperations {
  listFiles: (folderId?: string) => Promise<DriveItem[]>;
  getFileDetails: (fileId: string) => Promise<DriveItem>;
  getDownloadUrl: (fileId: string) => Promise<string>;
  getFolderPath: (
    folderId: string
  ) => Promise<Array<{ path: string; name: string; id: string }>>;
  getItemByPath: (filePath: string) => Promise<DriveItem>;
  getItemById: (itemId: string) => Promise<DriveItem>;
  getPathForItem: (itemId: string) => Promise<string>;
  getChildrenByPath: (path: string) => Promise<DriveItem[]>;
  getPathComponents: (
    path: string
  ) => Promise<Array<{ path: string; name: string; id: string }>>;
  uploadFile: (file: File, path: string) => Promise<void>;
  uploadFromUrl: (url: string, path: string) => Promise<void>;
}

export function createOneDriveService(accessToken: string): OneDriveOperations {
  const baseUrl = "https://graph.microsoft.com/v1.0/me/drive";

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  return {
    async listFiles(folderId?: string): Promise<DriveItem[]> {
      const endpoint = folderId
        ? `${baseUrl}/items/${folderId}/children`
        : `${baseUrl}/root/children`;

      const response = await fetch(endpoint, { headers });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch files");
      }

      const data = await response.json();
      return data.value;
    },

    async getFileDetails(fileId: string): Promise<DriveItem> {
      const response = await fetch(`${baseUrl}/items/${fileId}`, { headers });

      if (!response.ok) {
        throw new Error("Failed to fetch file information");
      }

      return await response.json();
    },

    async getDownloadUrl(fileId: string): Promise<string> {
      const response = await fetch(`${baseUrl}/items/${fileId}`, { headers });

      if (!response.ok) {
        throw new Error("Failed to fetch download URL");
      }

      const item = await response.json();
      return item["@microsoft.graph.downloadUrl"] || item.webUrl;
    },

    async getFolderPath(
      itemId: string
    ): Promise<Array<{ path: string; name: string; id: string }>> {
      if (!itemId || itemId === "root") {
        return [{ path: "/drive/root:", name: "Root", id: "root" }];
      }

      const response = await fetch(`${baseUrl}/items/${itemId}`, { headers });

      if (!response.ok) {
        throw new Error("Failed to fetch folder path");
      }

      const item = await response.json();
      let path = item.parentReference?.path || "";
      path = path.replace("/drive/root:", "");

      const segments = [{ path: "/drive/root:", name: "Root", id: "root" }];

      if (path) {
        const parts = path.split("/").filter(Boolean);
        let currentPath = "";

        for (const part of parts) {
          currentPath += "/" + part;
          segments.push({
            path: currentPath,
            name: part,
            id: "", // We need additional API calls to get IDs
          });
        }
      }

      segments.push({
        path: path + "/" + item.name,
        name: item.name,
        id: item.id,
      });

      return segments;
    },

    async getItemByPath(filePath: string): Promise<DriveItem> {
      // Normalize the path first
      const normalizedPath = normalizePath(filePath);

      // Convert to API path
      const apiPath = `/${normalizedPath}`;
      const encodedPath = encodeURIComponent(apiPath);

      const response = await fetch(`${baseUrl}/root:${encodedPath}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch item at path: ${filePath}`);
      }

      return await response.json();
    },

    async getItemById(itemId: string): Promise<DriveItem> {
      const response = await fetch(`${baseUrl}/items/${itemId}`, { headers });

      if (!response.ok) {
        throw new Error("Failed to fetch item information");
      }

      return await response.json();
    },

    async getPathForItem(itemId: string): Promise<string> {
      const response = await fetch(`${baseUrl}/items/${itemId}`, { headers });

      if (!response.ok) {
        throw new Error("Failed to fetch item path");
      }

      const item = await response.json();
      let path = item.parentReference?.path || "";
      path = path.replace("/drive/root:", "");

      return `${path}/${item.name}`.replace(/^\//, ""); // Remove leading slash
    },

    async getChildrenByPath(path: string): Promise<DriveItem[]> {
      // Handle root special case
      if (!path || path === "/" || path === "root") {
        return this.listFiles();
      }

      // Normalize the path
      const normalizedPath = normalizePath(path);

      // Create API path
      const apiPath = `/${normalizedPath}`;
      const encodedPath = encodeURIComponent(apiPath);

      const response = await fetch(`${baseUrl}/root:${encodedPath}:/children`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch children at path: ${path}`);
      }

      const data = await response.json();
      return data.value;
    },

    async getPathComponents(
      path: string
    ): Promise<Array<{ path: string; name: string; id: string }>> {
      // Handle special cases
      if (!path || path === "/" || path === "root") {
        return [{ path: "/drive/root:", name: "Home", id: "root" }];
      }

      // Normalize and split the path into components
      const normalizedPath = normalizePath(path);
      const components = normalizedPath.split("/").filter(Boolean);
      const breadcrumbs = [{ path: "/drive/root:", name: "Home", id: "root" }];

      // Build the breadcrumb path components
      let currentPath = "";
      for (let i = 0; i < components.length; i++) {
        // Ensure we're building paths with proper separators
        currentPath = currentPath
          ? `${currentPath}/${components[i]}`
          : components[i];

        // Get the item ID for this path segment
        try {
          const item = await this.getItemByPath(currentPath);
          breadcrumbs.push({
            path: currentPath,
            name: components[i],
            id: item.id,
          });
        } catch (error) {
          console.error(
            `Failed to get item for path segment: ${currentPath}`,
            error
          );
        }
      }

      return breadcrumbs;
    },

    async uploadFile(file: File, path: string): Promise<void> {
      try {
        // Normalize the path
        const normalizedPath = path.split("/").filter(Boolean).join("/");

        // For root uploads, use a different endpoint
        const uploadEndpoint = normalizedPath
          ? `${baseUrl}/root:/${normalizedPath}/${file.name}:/content`
          : `${baseUrl}/root/children/${file.name}/content`;

        if (file.size < 4 * 1024 * 1024) {
          // Small file upload (< 4MB)
          const response = await fetch(uploadEndpoint, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": file.type || "application/octet-stream",
            },
            body: file,
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(
              error.error ? error.error.message : "Upload failed"
            );
          }

          return;
        }

        // For larger files, use upload session
        const sessionEndpoint = normalizedPath
          ? `${baseUrl}/root:/${normalizedPath}/${file.name}:/createUploadSession`
          : `${baseUrl}/root/children/${file.name}/createUploadSession`;

        const uploadSessionResponse = await fetch(sessionEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "@microsoft.graph.conflictBehavior": "rename",
            description: "Uploaded via OneDrive Explorer",
            fileSize: file.size,
            name: file.name,
          }),
        });

        const sessionData = await uploadSessionResponse.json();

        if (!uploadSessionResponse.ok) {
          console.error("Upload session creation failed:", {
            status: uploadSessionResponse.status,
            statusText: uploadSessionResponse.statusText,
            response: sessionData,
          });
          throw new Error(
            sessionData.error
              ? `Failed to create upload session: ${sessionData.error.message}`
              : "Failed to create upload session"
          );
        }

        const { uploadUrl } = sessionData;
        if (!uploadUrl) {
          throw new Error("No upload URL received from session creation");
        }

        // Upload file in chunks
        const chunkSize = 320 * 1024; // 320 KB chunks
        const fileSize = file.size;
        let start = 0;

        while (start < fileSize) {
          const end = Math.min(start + chunkSize, fileSize);
          const chunk = file.slice(start, end);

          const uploadChunkResponse = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Length": `${end - start}`,
              "Content-Range": `bytes ${start}-${end - 1}/${fileSize}`,
            },
            body: chunk,
          });

          if (!uploadChunkResponse.ok) {
            const chunkError = await uploadChunkResponse.text();
            console.error("Chunk upload failed:", {
              status: uploadChunkResponse.status,
              statusText: uploadChunkResponse.statusText,
              error: chunkError,
            });
            throw new Error(
              `Failed to upload chunk: ${uploadChunkResponse.statusText}`
            );
          }

          start = end;
        }

        console.log("File upload completed successfully");
      } catch (error) {
        console.error("Upload error:", error);
        throw error;
      }
    },

    async uploadFromUrl(url: string, path: string): Promise<void> {
      // Get file name from URL
      const fileName = url.split("/").pop() || "downloaded_file";

      // Create upload session
      const uploadSession = await fetch(
        `${baseUrl}/root:${path}/${fileName}:/createUploadSession`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!uploadSession.ok) {
        throw new Error("Failed to create upload session");
      }

      const { uploadUrl } = await uploadSession.json();

      // Fetch the file from URL
      const response = await fetch(url);
      const fileSize = parseInt(response.headers.get("content-length") || "0");
      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error("Failed to read file from URL");
      }

      let uploaded = 0;
      const chunkSize = 320 * 1024; // 320 KB chunks
      let buffer = new Uint8Array(0);

      while (true) {
        const { done, value } = await reader.read();

        if (done && buffer.length === 0) break;

        // Append new data to buffer
        if (value) {
          const newBuffer = new Uint8Array(buffer.length + value.length);
          newBuffer.set(buffer);
          newBuffer.set(value, buffer.length);
          buffer = newBuffer;
        }

        // Upload complete chunks
        while (buffer.length >= chunkSize || (done && buffer.length > 0)) {
          const chunk = buffer.slice(0, chunkSize);
          const end = Math.min(uploaded + chunk.length, fileSize);

          await fetch(uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Length": `${chunk.length}`,
              "Content-Range": `bytes ${uploaded}-${end - 1}/${fileSize}`,
            },
            body: chunk,
          });

          uploaded += chunk.length;
          buffer = buffer.slice(chunk.length);
        }
      }
    },
  };
}

function normalizePath(path: string): string {
  // Remove leading slash if exists
  let normalizedPath = path.startsWith("/") ? path.substring(1) : path;

  // Ensure we don't have double slashes
  normalizedPath = normalizedPath.replace(/\/+/g, "/");

  return normalizedPath;
}
