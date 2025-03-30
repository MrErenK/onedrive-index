import { useState, useCallback } from "react";
import { useLoaderData } from "@remix-run/react";
import {
  createOneDriveService,
  OneDriveOperations,
} from "~/services/onedrive.service";
import type { DriveItem } from "~/utils/onedrive.server";

interface UseOneDriveOptions {
  initialItems?: DriveItem[];
  accessToken?: string;
}

export function useOneDrive({
  initialItems = [],
  accessToken,
}: UseOneDriveOptions = {}) {
  const [items, setItems] = useState<DriveItem[]>(initialItems);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loaderData = useLoaderData<{ accessToken?: string }>();
  const token = accessToken || loaderData.accessToken;

  // Create service only if we have a token
  const service: OneDriveOperations | null = token
    ? createOneDriveService(token)
    : null;

  const fetchFiles = useCallback(
    async (folderId?: string) => {
      if (!service) return;

      setLoading(true);
      setError(null);

      try {
        const files = await service.listFiles(folderId);
        setItems(files);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch files");
      } finally {
        setLoading(false);
      }
    },
    [service]
  );

  const searchFiles = useCallback(
    async (query: string): Promise<DriveItem[]> => {
      if (!token) throw new Error("No access token available");

      try {
        const response = await fetch(
          `https://graph.microsoft.com/v1.0/me/drive/root/search(q='${query}')?select=id,name,size,folder,lastModifiedDateTime`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();
        return data.value;
      } catch (err) {
        console.error("Search error:", err);
        throw err;
      }
    },
    [token]
  );

  const getFileDetails = useCallback(
    async (fileId: string) => {
      if (!service) return null;

      try {
        return await service.getFileDetails(fileId);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to get file details"
        );
        return null;
      }
    },
    [service]
  );

  const getDownloadUrl = useCallback(
    async (fileId: string) => {
      if (!service) return null;

      try {
        return await service.getDownloadUrl(fileId);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to get download URL"
        );
        return null;
      }
    },
    [service]
  );

  return {
    items,
    loading,
    error,
    fetchFiles,
    searchFiles,
    getFileDetails,
    getDownloadUrl,
    service,
  };
}
