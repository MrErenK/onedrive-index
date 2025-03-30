import { type LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/utils/db.server";
import { refreshAccessToken, getCurrentSession } from "~/utils/auth.server";
import * as fs from "fs";
import * as path from "path";

// Helper function to get the secret key
function getSecretKey() {
  try {
    const secretPath = path.join(process.cwd(), ".refresh-secret");
    return fs.existsSync(secretPath)
      ? fs.readFileSync(secretPath, "utf8").trim()
      : null;
  } catch (error) {
    console.error("Error reading refresh secret:", error);
    return null;
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Check for secret key if request is from our script
  const secretKey = getSecretKey();
  const providedSecret = request.headers.get("X-Refresh-Secret");

  const isAuthenticated = (await getCurrentSession(request)) !== null;
  const hasValidSecret = secretKey && providedSecret === secretKey;

  // Allow the refresh if request has a valid session OR a valid secret
  if (!isAuthenticated && !hasValidSecret) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const expirationThreshold = new Date(Date.now() + 10 * 60 * 1000);

    // Get all sessions that need refreshing
    const sessions = await prisma.session.findMany({
      where: {
        expiresAt: {
          lt: expirationThreshold,
        },
      },
    });

    const results: Array<{
      id: string;
      success: boolean;
      newExpiresAt?: string;
      error?: string;
    }> = [];

    if (sessions.length === 0) {
      return Response.json({
        success: true,
        message: "No tokens need refreshing",
      });
    }

    for (const session of sessions) {
      try {
        const tokens = await refreshAccessToken(session.refreshToken);

        // Update session with new tokens
        await prisma.session.update({
          where: { id: session.id },
          data: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: new Date(tokens.expiresAt),
            updatedAt: new Date(),
          },
        });

        results.push({
          id: session.id,
          success: true,
          newExpiresAt: tokens.expiresAt,
        });
      } catch (error) {
        console.error(
          `Failed to refresh token for session ${session.id}:`,
          error
        );

        // If refresh fails, mark the session for deletion
        try {
          await prisma.session.delete({
            where: { id: session.id },
          });
        } catch (deleteError) {
          console.error(
            `Failed to delete invalid session ${session.id}:`,
            deleteError
          );
        }

        results.push({
          id: session.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Get updated session count
    const remainingSessions = await prisma.session.count();

    return Response.json({
      success: true,
      refreshed: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      remainingSessions,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to refresh tokens",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
