import { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { logout, verifyPassword } from "~/utils/auth.server";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Icons } from "~/components/icons";
import { useTranslation } from "react-i18next";

export const meta: MetaFunction = () => {
  return [
    { title: "Logout | OneDrive Explorer" },
    {
      name: "description",
      content: "Log out from your OneDrive Explorer session",
    },
  ];
};

export async function loader() {
  // Instead of immediately logging out, we'll show a verification form
  return Response.json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const password = formData.get("password");

  if (typeof password !== "string") {
    return Response.json({ error: "Password is required" }, { status: 400 });
  }

  const isValid = await verifyPassword(password);

  if (!isValid) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  // Password is verified, proceed with logout
  const response = await logout();

  // Clear the password verification cookie
  response.headers.append(
    "Set-Cookie",
    "password_verified=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
  );

  return response;
}

export default function Logout() {
  const actionData = useActionData<typeof action>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50 px-6 py-12 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800 sm:p-10"
      >
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-gray-100 p-4 shadow-inner dark:bg-black/40 dark:shadow-gray-800/20">
            <Icons.Logout className="h-9 w-9 text-gray-700 dark:text-gray-300" />
          </div>
        </div>
        <h2 className="mb-3 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
          {t("auth.logoutConfirm")}
        </h2>
        <p className="mb-8 text-center text-gray-600 dark:text-gray-400">
          {t("auth.logoutMessage")}
        </p>

        <AnimatePresence>
          {actionData?.error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icons.Error className="h-5 w-5 text-red-500 dark:text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-sm text-red-800 dark:text-red-200">
                    {actionData.error}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Form method="post" onSubmit={() => setIsSubmitting(true)}>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("auth.password")}
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3.5 text-gray-900 shadow-sm transition-colors focus:border-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-1 dark:border-gray-700 dark:bg-gray-800/80 dark:text-white dark:placeholder-gray-400 dark:focus:border-gray-500 dark:focus:bg-gray-800 dark:focus:ring-gray-700 dark:focus:ring-offset-gray-900"
                placeholder={t("auth.enterPassword")}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-1 items-center justify-center rounded-lg bg-gray-900 px-5 py-3.5 text-base font-medium text-white shadow-sm transition-all hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-70 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-600 dark:focus:ring-offset-gray-900"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Icons.Spinner className="mr-2.5 h-5 w-5 animate-spin text-white" />
                  {t("auth.loggingOut")}
                </div>
              ) : (
                t("common.continue")
              )}
            </motion.button>

            <motion.a
              href="/files"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-base font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700/70 dark:focus:ring-gray-600 dark:focus:ring-offset-gray-900"
            >
              {t("common.cancel")}
            </motion.a>
          </div>
        </Form>

        {isSubmitting && (
          <div className="mt-8">
            <div className="mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
              <motion.div
                className="h-full bg-gray-800 dark:bg-gray-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
