import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getTokensFromCode, createUserSession } from "~/utils/auth.server";
import { Icons } from "~/components/icons";
import { useTranslation } from "react-i18next";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const redirectTo = url.searchParams.get("redirectTo") || "/files";

  // Handle error
  if (error) {
    return redirect(`/login?error=${error}`);
  }

  // Handle missing code
  if (!code) {
    return redirect("/login?error=missing_code");
  }

  try {
    // Exchange code for tokens
    const { accessToken, refreshToken, expiresAt } = await getTokensFromCode(
      code
    );

    // Get user info
    const userResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const userData = await userResponse.json();

    // Create user session
    return createUserSession(
      accessToken,
      refreshToken,
      expiresAt,
      userData,
      redirectTo
    );
  } catch (error) {
    console.error("Auth callback error:", error);
    return redirect(`/login?error=auth_failed`);
  }
}

export default function AuthCallback() {
  const { t } = useTranslation();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-950 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-800 transition-all">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
          {t("common.loggingIn")}
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {t("common.loggingInMessage")}
        </p>
        <div className="mt-6 flex justify-center">
          <Icons.Spinner className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-500" />
        </div>
      </div>
    </div>
  );
}
