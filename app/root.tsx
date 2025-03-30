import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { ThemeProvider } from "./components/theme-provider";
import { Icons } from "./components/icons";
import { useTranslation } from "react-i18next";
import i18next from "~/utils/i18n.server";

import "./tailwind.css";

export const meta: MetaFunction = () => {
  return [
    { title: "OneDrive Explorer" },
    { name: "description", content: "Browse and view your OneDrive files" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { charSet: "utf-8" },
    { name: "color-scheme", content: "light dark" },
    { name: "theme-color", content: "#ffffff" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "default" },
  ];
};

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },

  { rel: "icon", href: "/favicon.ico", sizes: "any" },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
  { rel: "manifest", href: "/site.webmanifest" },
];

export default function App() {
  return (
    <Document>
      <ThemeProvider>
        <Outlet />
      </ThemeProvider>
    </Document>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const locale = await i18next.getLocale(request);
  return Response.json({ locale });
}

export let handle = {
  // In the handle export, we can add a i18n key with namespaces our route
  // will need to load. This key can be a single string or an array of strings.
  // TIP: In most cases, you should set this to your defaultNS from your i18n config
  // or if you did not set one, set it to the i18next default namespace "translation"
  i18n: "common",
};

function Document({ children }: { children: React.ReactNode }) {
  // Get the locale from the loader
  const { locale } = useLoaderData<typeof loader>();

  const { i18n } = useTranslation();

  return (
    <html lang={locale} dir={i18n.dir()} className="h-full scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-white text-gray-900 antialiased selection:bg-gray-200 dark:bg-gray-900 dark:text-gray-50 dark:selection:bg-gray-700">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  let title = "Error";
  let message = "Sorry, an unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = error.data;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-white text-gray-900 antialiased selection:bg-gray-200 dark:bg-gray-900 dark:text-gray-50 dark:selection:bg-gray-700">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-md transform overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/30 sm:p-8">
              <div className="mb-6 flex items-center justify-center">
                <Icons.Warning className="h-10 w-10 animate-pulse text-red-500 dark:text-red-400" />
              </div>
              <h1 className="mb-3 text-center text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              <p className="mb-6 text-center text-base text-gray-600 dark:text-gray-300">
                {message}
              </p>
              <div className="flex justify-center">
                <a
                  href="/"
                  className="group relative overflow-hidden rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white shadow-md transition-all duration-300 ease-in-out hover:bg-gray-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 active:scale-95 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-500"
                >
                  <span className="relative z-10">Return Home</span>
                  <span className="absolute inset-0 -z-0 h-full w-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 transition-all duration-300 group-hover:w-full group-hover:opacity-20"></span>
                </a>
              </div>
            </div>
          </div>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
