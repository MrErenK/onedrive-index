import {
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  useLoaderData,
  useSearchParams,
  Form,
  useActionData,
} from "@remix-run/react";
import {
  getAuthorizationUrl,
  getCurrentSession,
  verifyPassword,
  isPasswordSet,
  saveSecrets,
} from "~/utils/auth.server";
import { Icons } from "~/components/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import crypto from "crypto";
import { useTranslation } from "react-i18next";

export const meta: MetaFunction = () => {
  return [
    { title: "Logging in | OneDrive Explorer" },
    {
      name: "description",
      content: "Log in to your OneDrive Explorer account",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if user is already logged in
  const session = await getCurrentSession();
  if (session) return redirect("/files");

  // Check if password is set
  const passwordIsSet = await isPasswordSet();

  // Generate a random state parameter for security
  const state = Math.random().toString(36).substring(2, 15);
  const authUrl = getAuthorizationUrl(state);

  return Response.json({ authUrl, passwordIsSet });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("_action");

  // Handle initial setup
  if (action === "setup") {
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (typeof password !== "string" || password.length < 8) {
      return Response.json(
        {
          error: "Password must be at least 8 characters long",
          isSetup: true,
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return Response.json(
        {
          error: "Passwords do not match",
          isSetup: true,
        },
        { status: 400 }
      );
    }

    // Generate session secret if needed
    const sessionSecret = crypto.randomBytes(64).toString("hex");

    try {
      // Save the password and session secret
      await saveSecrets(password, sessionSecret);

      return Response.json({
        success: "Setup complete",
        isSetup: false,
      });
    } catch (error) {
      return Response.json(
        {
          error: "Setup failed",
          isSetup: true,
        },
        { status: 500 }
      );
    }
  }

  // Handle normal login
  const password = formData.get("password");

  if (typeof password !== "string") {
    return Response.json({ error: "Password required" }, { status: 400 });
  }

  const isValid = await verifyPassword(password);
  if (!isValid) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  // Store password verification in session
  const url = new URL(request.url);

  // Create a response with a cookie
  const response = redirect("/auth/microsoft");
  response.headers.set(
    "Set-Cookie",
    `password_verified=true; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`
  );

  return response;
}

export default function Login() {
  const { authUrl, passwordIsSet } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error") || actionData?.error;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSetup, setIsSetup] = useState(!passwordIsSet);
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  // If setup was successful, show login form
  useEffect(() => {
    if (actionData?.success) {
      setIsSetup(false);
    }
  }, [actionData]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset submitting state when error occurs
  useEffect(() => {
    if (error) {
      setIsSubmitting(false);
    }
  }, [error]);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <div className="flex min-h-[100dvh] flex-col items-center justify-center px-5 py-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-black/5 dark:bg-gray-800/90 dark:ring-white/10 dark:shadow-2xl dark:shadow-gray-900/30"
        >
          <div className="relative">
            <div
              className="absolute inset-0 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900"
              style={{
                backgroundImage: mounted
                  ? "linear-gradient(120deg, rgba(56,189,248,0.8) 0%, rgba(29,78,216,0.8) 50%, rgba(124,58,237,0.8) 100%)"
                  : "",
              }}
            />
            <div className="relative px-6 pt-24 pb-10">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mb-8 text-center"
              >
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-md dark:bg-gray-800/90 dark:shadow-gray-900/30 transform -translate-y-2">
                  <Icons.Cloud className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                  {t("common.siteTitle")}
                </h1>
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                  {isSetup ? t("auth.setupWelcome") : t("auth.loginMessage")}
                </p>
              </motion.div>

              <AnimatePresence>
                {actionData?.success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800/30 dark:bg-green-900/20"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Icons.Check className="h-5 w-5 text-green-500 dark:text-green-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          {actionData.success}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/30 dark:bg-red-900/20"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Icons.Error className="h-5 w-5 text-red-500 dark:text-red-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          {error === "auth_failed" && t("auth.authFailed")}
                          {error === "missing_code" && t("auth.missingCode")}
                          {error === "Invalid password" &&
                            t("auth.invalidPassword2")}
                          {error !== "auth_failed" &&
                            error !== "missing_code" &&
                            error !== "Invalid password" &&
                            `${error}`}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isSetup ? (
                <Form
                  method="post"
                  className="space-y-6"
                  onSubmit={() => setIsSubmitting(true)}
                >
                  <input type="hidden" name="_action" value="setup" />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
                    >
                      {t("auth.createPassword")}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="password"
                        id="password"
                        required
                        minLength={8}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700/70 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:bg-gray-700 dark:focus:ring-blue-400/20"
                        placeholder={t("auth.createPassPlaceholder")}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
                    >
                      {t("auth.confirmPassword")}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        required
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700/70 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:bg-gray-700 dark:focus:ring-blue-400/20"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-base font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 dark:focus:ring-offset-gray-900 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <Icons.Spinner className="mr-2 h-5 w-5 animate-spin text-white" />
                        <span>{t("auth.settingUp")}</span>
                      </div>
                    ) : (
                      <span>{t("auth.completeSetup")}</span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></span>
                  </motion.button>

                  <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                    {t("auth.passwordNotice")}
                  </div>
                </Form>
              ) : (
                <Form
                  method="post"
                  className="space-y-6"
                  onSubmit={() => setIsSubmitting(true)}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
                    >
                      {t("auth.password")}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="password"
                        id="password"
                        required
                        autoComplete="current-password"
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700/70 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:bg-gray-700 dark:focus:ring-blue-400/20"
                        placeholder={t("auth.enterPassword")}
                      />
                    </div>
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-base font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 dark:from-blue-700 dark:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 dark:focus:ring-offset-gray-900 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <Icons.Spinner className="mr-2 h-5 w-5 animate-spin text-white" />
                        <span>{t("auth.verifying")}</span>
                      </div>
                    ) : (
                      t("common.continue")
                    )}
                    <span className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></span>
                  </motion.button>

                  <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                    {t("auth.secureLogin")}
                  </div>
                </Form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
