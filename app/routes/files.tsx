import { LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import {
  useLoaderData,
  useNavigation,
  useLocation,
  Outlet,
} from "@remix-run/react";
import { useState, useEffect, useMemo } from "react";
import { requireAuth } from "~/utils/auth.server";
import { createOneDriveService } from "~/services/onedrive.service";
import { Header } from "~/components/header";
import { ErrorAlert } from "~/components/error-alert";
import { LoadingBar } from "~/components/loading-bar";
import { Footer } from "~/components/footer";
import { motion, AnimatePresence } from "framer-motion";
import type { DriveItem } from "~/utils/onedrive.server";
import { useOneDrive } from "~/hooks/useOnedrive";
import { ReadmePreview } from "~/components/file-previews/readme-preview";
import { FilesHeader } from "~/components/files/files-header";
import { BreadcrumbsNav } from "~/components/files/breadcrumbs-nav";
import { FilesContainer } from "~/components/files/files-container";
import { useSortPreference } from "~/hooks/useSortPreference";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const folderName =
    data?.breadcrumbs?.length > 0
      ? data.breadcrumbs[data.breadcrumbs.length - 1].name
      : "Files";

  return [
    { title: `${folderName} | OneDrive Explorer` },
    { name: "description", content: `Browsing in ${folderName}` },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { accessToken, user } = await requireAuth(request);
  const url = new URL(request.url);
  const folderPath = url.searchParams.get("folder") || undefined;

  try {
    const service = createOneDriveService(accessToken);
    const files = folderPath
      ? await service.getChildrenByPath(decodeURIComponent(folderPath))
      : await service.listFiles();

    const breadcrumbs = folderPath
      ? await service.getPathComponents(decodeURIComponent(folderPath))
      : [{ path: "/drive/root:", name: "Home", id: "root" }];

    // Initialize to empty array if files is undefined
    const filesArray = Array.isArray(files) ? files : [];

    // Look for README.md file
    const readmeFile = filesArray.find(
      (file) => file.name.toLowerCase() === "readme.md"
    );

    let readmeContent = null;
    if (readmeFile) {
      try {
        const downloadUrl = await service.getDownloadUrl(readmeFile.id);
        const response = await fetch(downloadUrl);
        readmeContent = await response.text();
      } catch (error) {
        console.error("Error fetching README content:", error);
      }
    }

    const sortedFiles = [...filesArray].sort((a, b) => {
      if (a.folder && !b.folder) return -1;
      if (!a.folder && b.folder) return 1;
      return a.name.localeCompare(b.name);
    });

    return Response.json({
      files: sortedFiles,
      breadcrumbs,
      user,
      accessToken,
      readmeContent,
      error: null,
    });
  } catch (error) {
    console.error("Error loading files:", error);
    return Response.json({
      files: [],
      breadcrumbs: [{ path: "/drive/root:", name: "Home", id: "root" }],
      user,
      accessToken,
      readmeContent: null,
      error: "Failed to load files. Please try again.",
    });
  }
}

export default function Files() {
  const { files, breadcrumbs, user, error, readmeContent } =
    useLoaderData<typeof loader>();
  const [showReadme, setShowReadme] = useState(Boolean(readmeContent));
  const navigation = useNavigation();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<"list" | "grid">(() => {
    // Try to get from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("viewMode");
      return saved === "grid" ? "grid" : "list";
    }
    return "list";
  });
  const { searchFiles } = useOneDrive();
  const [scrolled, setScrolled] = useState(false);
  const scrollThreshold = 20;
  const currentPath = breadcrumbs
    .slice(1)
    .map((crumb: any) => crumb.name)
    .join("/");
  const { sortField, sortDirection, handleSort } = useSortPreference();

  useEffect(() => {
    localStorage.setItem("sortField", sortField);
    localStorage.setItem("sortDirection", sortDirection);
  }, [sortField, sortDirection]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolledNow = window.scrollY > scrollThreshold;
      setScrolled(isScrolledNow);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Save view mode preference
  useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  const isLoadingNextPage =
    navigation.state === "loading" && navigation.location.pathname !== "/files";

  const isChangingFolder =
    navigation.state === "loading" &&
    navigation.location.pathname === "/files" &&
    navigation.location.search !== location.search;

  const handleSearch = async (query: string) => {
    try {
      return await searchFiles(query);
    } catch (error) {
      console.error("Search error:", error);
      throw error;
    }
  };

  const sortedFiles = useMemo(() => {
    const sortedArray = [...files];

    sortedArray.sort((a, b) => {
      // Always keep folders at the top
      if (a.folder && !b.folder) return -1;
      if (!a.folder && b.folder) return 1;

      // Then sort by the selected field
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "modified":
          comparison =
            new Date(b.lastModifiedDateTime).getTime() -
            new Date(a.lastModifiedDateTime).getTime();
          break;
        case "size":
          const sizeA = a.size || 0;
          const sizeB = b.size || 0;
          comparison = sizeA - sizeB;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sortedArray;
  }, [files, sortField, sortDirection]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 via-gray-50/80 to-white dark:from-gray-900 dark:via-black dark:to-gray-900/80">
      {navigation.state === "loading" && <LoadingBar />}

      <Header user={user} onSearch={handleSearch} scrolled={scrolled} />

      {!location.pathname.startsWith("/files/view/") ? (
        <main className="flex-1 px-3 pt-5 pb-20 sm:px-6 md:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            {!isLoadingNextPage && (
              <>
                <BreadcrumbsNav breadcrumbs={breadcrumbs} />

                <FilesHeader
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  fileCount={files.length}
                />

                <AnimatePresence mode="wait">
                  {error && <ErrorAlert message={error} />}
                </AnimatePresence>

                <FilesContainer
                  files={sortedFiles}
                  currentPath={currentPath}
                  viewMode={viewMode}
                  isLoading={isChangingFolder}
                  onSort={handleSort}
                  sortField={sortField}
                  sortDirection={sortDirection}
                />

                <AnimatePresence>
                  {showReadme && readmeContent && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4 }}
                      className="mt-6"
                    >
                      <ReadmePreview
                        content={readmeContent}
                        onClose={() => setShowReadme(false)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </main>
      ) : null}

      <Outlet />
      <Footer />
    </div>
  );
}
