import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { getAuthorizationUrl } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if password was verified
  const cookie = request.headers.get("Cookie");
  const isPasswordVerified = cookie?.includes("password_verified=true");

  if (!isPasswordVerified) {
    return redirect("/login");
  }

  // Generate a random state parameter for security
  const state = Math.random().toString(36).substring(2, 15);
  const authUrl = getAuthorizationUrl(state);

  return redirect(authUrl);
}
