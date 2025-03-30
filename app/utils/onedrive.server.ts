import { createOneDriveService } from "~/services/onedrive.service";

export type DriveItem = {
  id: string;
  name: string;
  folder?: {
    childCount: number;
  };
  file?: {
    mimeType: string;
    size: number;
  };
  size?: number;
  lastModifiedDateTime: string;
  webUrl: string;
  parentReference?: {
    path: string;
    id: string;
  };
  thumbnails?: {
    id: string;
    large: {
      url: string;
    };
    medium: {
      url: string;
    };
    small: {
      url: string;
    };
  }[];
};

export async function listFiles(
  accessToken: string,
  itemId?: string
): Promise<DriveItem[]> {
  try {
    const service = createOneDriveService(accessToken);
    return await service.listFiles(itemId);
  } catch (error) {
    console.error("Error fetching files:", error);
    throw error;
  }
}

export async function getFolderPath(
  accessToken: string,
  itemId: string
): Promise<Array<{ path: string; name: string; id: string }>> {
  try {
    const service = createOneDriveService(accessToken);
    return await service.getFolderPath(itemId);
  } catch (error) {
    console.error("Error fetching folder path:", error);
    return [{ path: "/drive/root:", name: "Root", id: "root" }];
  }
}

export async function getDownloadUrl(
  accessToken: string,
  itemId: string
): Promise<string> {
  try {
    const service = createOneDriveService(accessToken);
    return await service.getDownloadUrl(itemId);
  } catch (error) {
    console.error("Error fetching download URL:", error);
    throw error;
  }
}
