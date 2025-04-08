import { LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import {
  useLoaderData,
  useNavigation,
  useLocation,
  Outlet,
  Link,
} from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import { requireAuth } from "~/utils/auth.server";
import { createOneDriveService } from "~/services/onedrive.service";
import { FileListView } from "~/components/file-list-view";
import { FileGridView } from "~/components/file-grid-view";
import { Header } from "~/components/header";
import { ViewToggle } from "~/components/view-toggle";
import { ErrorAlert } from "~/components/error-alert";
import { LoadingBar } from "~/components/loading-bar";
import { Footer } from "~/components/footer";
import { LoadingSpinner } from "~/components/loading-spinner";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "~/components/icons";
import type { DriveItem } from "~/utils/onedrive.server";
import { useOneDrive } from "~/hooks/useOnedrive";
import { ReadmePreview } from "~/components/file-previews/readme-preview";
import { useTranslation } from "react-i18next";

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

function EmptyState() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900/50"
    >
      <div className="mb-6 rounded-full bg-gray-50 p-5 shadow-inner dark:bg-gray-800/50">
        <Icons.EmptyFolder className="h-12 w-12 text-gray-400 dark:text-gray-300" />
      </div>
      <h3 className="mb-3 text-xl font-medium text-gray-900 dark:text-white">
        {t("common.emptyFolder")}
      </h3>
      <p className="max-w-md text-gray-600 dark:text-gray-300">
        {t("common.emptyFolderDescription")}
      </p>
    </motion.div>
  );
}

function Breadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: Array<{ path: string; name: string; id: string }>;
}) {
  const { t } = useTranslation();
  return (
    <motion.nav
      className="mb-4 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ol className="flex flex-nowrap items-center whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-300">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <Icons.ArrowRight className="mx-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
            )}
            {index < breadcrumbs.length - 1 ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-md px-1.5 py-0.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Link
                  to={
                    crumb.id === "root"
                      ? "/files"
                      : `/files?folder=${encodeURIComponent(crumb.path)}`
                  }
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {crumb.id === "root" ? (
                    <span className="flex items-center">
                      <Icons.Home className="mr-1 h-4 w-4" />
                      {t("common.home")}
                    </span>
                  ) : (
                    crumb.name
                  )}
                </Link>
              </motion.div>
            ) : (
              <span className="rounded-md bg-gray-100 px-2.5 py-1 font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                {crumb.id === "root" ? (
                  <span className="flex items-center">
                    <Icons.Home className="mr-1 h-4 w-4" />
                    {t("common.home")}
                  </span>
                ) : (
                  crumb.name
                )}
              </span>
            )}
          </li>
        ))}
      </ol>
    </motion.nav>
  );
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
  const [showMainViewToggle, setShowMainViewToggle] = useState(true);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const scrollThreshold = 20;
  const currentPath = breadcrumbs
    .slice(1)
    .map((crumb: any) => crumb.name)
    .join("/");
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      // Clear any existing timeout to debounce rapid scroll events
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      const isScrolledNow = window.scrollY > scrollThreshold;

      // Update the scrolled state immediately without delay
      setScrolled(isScrolledNow);

      // Only update the main toggle with a debounce
      scrollTimeout.current = setTimeout(() => {
        setShowMainViewToggle(!isScrolledNow);
      }, 100); // Short delay to avoid flickering
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
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

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-900/30">
      {navigation.state === "loading" && <LoadingBar />}
      <Header
        user={user}
        onSearch={handleSearch}
        viewMode={viewMode}
        setViewMode={setViewMode}
        scrolled={scrolled}
      />

      {!location.pathname.startsWith("/files/view/") ? (
        <main className="flex-1 px-3 pt-5 pb-16 sm:px-6 md:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            {!isLoadingNextPage && (
              <>
                <div
                  className={`${
                    location.pathname === "/files" ? "sticky top-16 z-10" : ""
                  }`}
                >
                  <Breadcrumbs breadcrumbs={breadcrumbs} />

                  <AnimatePresence mode="wait">
                    {showMainViewToggle && (
                      <motion.div
                        key="main-view-toggle"
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                          marginBottom: 20,
                        }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <h1 className="hidden text-xl font-semibold text-gray-800 dark:text-white sm:block">
                            {t("common.files")}
                          </h1>
                          <ViewToggle
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence mode="wait">
                  {error && <ErrorAlert message={error} />}
                </AnimatePresence>

                {/* Files view container with conditional blur */}
                <div className="relative mt-6 sm:mt-6">
                  {/* Loading overlay only for the files view */}
                  {isChangingFolder && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-sm transition-all duration-300 dark:bg-black/40">
                      <LoadingSpinner
                        size="medium"
                        className="mt-8 border-4 border-gray-300/30 border-t-blue-600 dark:border-gray-600/30 dark:border-t-blue-400"
                      />
                    </div>
                  )}

                  {/* Files content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={location.search}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`rounded-xl ${
                        isChangingFolder ? "pointer-events-none" : ""
                      }`}
                    >
                      {files.length === 0 ? (
                        <EmptyState />
                      ) : viewMode === "list" ? (
                        <FileListView
                          files={files as DriveItem[]}
                          currentPath={currentPath}
                        />
                      ) : (
                        <FileGridView
                          files={files as DriveItem[]}
                          currentPath={currentPath}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {showReadme && readmeContent && (
                    <ReadmePreview
                      content={readmeContent}
                      onClose={() => setShowReadme(false)}
                    />
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
