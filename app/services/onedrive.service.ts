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
  };
}

function normalizePath(path: string): string {
  // Remove leading slash if exists
  let normalizedPath = path.startsWith("/") ? path.substring(1) : path;

  // Ensure we don't have double slashes
  normalizedPath = normalizedPath.replace(/\/+/g, "/");

  return normalizedPath;
}
