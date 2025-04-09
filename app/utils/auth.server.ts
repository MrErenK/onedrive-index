import { redirect } from "@remix-run/node";
import {
  getSession,
  createSession as createDbSession,
  updateSession,
  deleteSession,
  deleteAllSessions,
} from "./db.server";
import fs from "fs";
import path from "path";

export interface SessionData {
  id: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  userData: UserData;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserData {
  id: string;
  displayName: string;
  userPrincipalName: string;
  [key: string]: any;
}

if (
  !process.env.MICROSOFT_APP_ID ||
  !process.env.MICROSOFT_APP_SECRET ||
  !process.env.REDIRECT_URI
) {
  throw new Error(
    "Required environment variables MICROSOFT_APP_ID, MICROSOFT_APP_SECRET, and REDIRECT_URI must be set"
  );
}

const clientId = process.env.MICROSOFT_APP_ID;
const clientSecret = process.env.MICROSOFT_APP_SECRET;
const tenant = process.env.MICROSOFT_APP_TENANT || "common";
const redirectUri = process.env.REDIRECT_URI;
const appPassword = process.env.APP_PASSWORD;

if (!clientId || !clientSecret || !redirectUri) {
  throw new Error(
    "Microsoft App credentials must be set in environment variables"
  );
}

export async function verifyPassword(password: string) {
  // If APP_PASSWORD isn't set, setup hasn't been completed
  if (!process.env.APP_PASSWORD) {
    throw new Error("Application not configured. Please complete setup first.");
  }
  return password === process.env.APP_PASSWORD;
}

export async function isPasswordSet() {
  return (
    process.env.APP_PASSWORD !== undefined &&
    process.env.APP_PASSWORD !== null &&
    process.env.APP_PASSWORD.length > 0
  );
}

export async function saveSecrets(password: string, sessionSecret: string) {
  try {
    const envPath = path.join(process.cwd(), ".env");
    let envContent = "";

    // Read existing env file if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
    }

    // Update or add APP_PASSWORD
    const passwordRegex = /^APP_PASSWORD=.*$/m;
    if (passwordRegex.test(envContent)) {
      envContent = envContent.replace(
        passwordRegex,
        `APP_PASSWORD=${password}`
      );
    } else {
      envContent += `\nAPP_PASSWORD=${password}`;
    }

    // Update or add SESSION_SECRET
    const secretRegex = /^SESSION_SECRET=.*$/m;
    if (secretRegex.test(envContent)) {
      envContent = envContent.replace(
        secretRegex,
        `SESSION_SECRET=${sessionSecret}`
      );
    } else {
      envContent += `\nSESSION_SECRET=${sessionSecret}`;
    }

    // Write updated content
    fs.writeFileSync(envPath, envContent);

    // Update the process env variables
    process.env.APP_PASSWORD = password;
    process.env.SESSION_SECRET = sessionSecret;

    return true;
  } catch (error) {
    console.error("Failed to save secrets:", error);
    throw new Error("Failed to save configuration");
  }
}

// Define authentication URLs
const authUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`;
const tokenUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;

// Define scopes
const scopes = ["offline_access", "user.read", "files.read", "files.read.all"];

function isTokenExpiringSoon(
  expiresAt: string | Date,
  thresholdMinutes: number = 5
): boolean {
  const expirationTime = new Date(expiresAt).getTime();
  const currentTime = Date.now();
  const timeUntilExpiry = expirationTime - currentTime;
  return timeUntilExpiry <= thresholdMinutes * 60 * 1000;
}

export async function getCurrentSession(request?: Request) {
  try {
    // Get the most recent active session
    const session = await getSession();

    if (!session) return null;

    // Check if token needs refresh (expires in next 5 minutes)
    if (session.expiresAt && isTokenExpiringSoon(session.expiresAt)) {
      try {
        const tokens = await refreshAccessToken(session.refreshToken);

        // Update session with new tokens
        const updatedSession = await updateSession(session.id, {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(tokens.expiresAt),
        });

        // Return the updated session with user data
        return {
          ...updatedSession,
          userData: session.userData,
        };
      } catch (refreshError: unknown) {
        console.error("Token refresh failed:", refreshError);

        // Only delete the session if the refresh token is invalid
        if (
          refreshError instanceof Error &&
          refreshError.message.includes("invalid_grant")
        ) {
          await deleteSession(session.id);
          return null;
        }

        // For other errors, return the existing session
        // This prevents immediate logout on temporary errors
        return session;
      }
    }

    return session;
  } catch (error) {
    console.error("Session retrieval error:", error);
    return null;
  }
}

export function getAuthorizationUrl(state: string) {
  if (!clientId || !redirectUri) {
    throw new Error("Missing required environment variables");
  }

  const params: Record<string, string> = {
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: scopes.join(" "),
    response_mode: "query",
    state: state,
  };

  const searchParams = new URLSearchParams(params);
  return `${authUrl}?${searchParams.toString()}`;
}

export async function getTokensFromCode(code: string) {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error_description || "Failed to get access token");
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error_description || "Failed to refresh token");
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  };
}

export async function createUserSession(
  accessToken: string,
  refreshToken: string,
  expiresAt: string,
  userData: any,
  redirectTo: string
) {
  // Delete any existing sessions
  await deleteAllSessions();

  // Create new session
  await createDbSession({
    accessToken,
    refreshToken,
    expiresAt,
    userData,
  });

  return redirect(redirectTo);
}

export async function logout(request?: Request) {
  // Delete all sessions
  await deleteAllSessions();
  return redirect("/");
}

export async function requireAuth(request: Request) {
  const session = await getCurrentSession(request);

  if (!session) {
    const url = new URL(request.url);
    throw redirect(`/login?redirectTo=${encodeURIComponent(url.pathname)}`);
  }

  return {
    accessToken: session.accessToken,
    user: session.userData,
  };
}
