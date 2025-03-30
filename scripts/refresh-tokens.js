import fetch from "node-fetch";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";
import process from "process";

const __filename = fileURLToPath(import.meta.url);

// Configuration
const CONFIG = {
  // How often to check for tokens to refresh (in milliseconds)
  refreshInterval: process.env.REFRESH_INTERVAL
    ? parseInt(process.env.REFRESH_INTERVAL)
    : 5 * 60 * 1000, // 5 minutes

  // Base URL of the application
  appUrl: process.env.APP_URL || "http://localhost:3000",

  // Path to store the secret key - make it absolute
  secretPath: join(dirname(dirname(__filename)), ".refresh-secret"),

  // Initial delay before first refresh attempt (when running concurrently)
  startupDelay: process.env.REFRESH_STARTUP_DELAY
    ? parseInt(process.env.REFRESH_STARTUP_DELAY)
    : 15000, // 15 seconds
};

// Generate a secret key specific to this server instance
const generateSecret = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Function to update .gitignore
function updateGitignore() {
  const gitignorePath = join(dirname(dirname(__filename)), ".gitignore");

  if (fs.existsSync(gitignorePath)) {
    try {
      let content = fs.readFileSync(gitignorePath, "utf8");
      const secretFilename = ".refresh-secret";

      // Only add if it's not already in .gitignore
      if (!content.includes(secretFilename)) {
        content = `${content}\n# Token refresh secret\n${secretFilename}\n`;
        fs.writeFileSync(gitignorePath, content);
        console.log(`[INFO] Added ${secretFilename} to .gitignore`);
      }
    } catch (err) {
      console.warn(`[WARN] Failed to update .gitignore: ${err.message}`);
    }
  }
}

// Get or create the secret key
function getSecretKey() {
  console.log(`[INFO] Looking for secret key at: ${CONFIG.secretPath}`);

  if (fs.existsSync(CONFIG.secretPath)) {
    console.log(`[INFO] Found existing secret key`);
    return fs.readFileSync(CONFIG.secretPath, "utf8").trim();
  } else {
    const secretKey = generateSecret();
    try {
      fs.writeFileSync(CONFIG.secretPath, secretKey);
      console.log(`[INFO] Created new secret key at ${CONFIG.secretPath}`);

      // Update .gitignore if it exists in the parent directory
      updateGitignore();
    } catch (err) {
      console.error(
        `[ERROR] Failed to write secret key to ${CONFIG.secretPath}:`,
        err
      );
      console.warn(
        `[WARN] Using temporary in-memory secret key that will change on restart`
      );
    }
    return secretKey;
  }
}

// The main refresh function
async function refreshTokens() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Checking for tokens to refresh...`);

  try {
    const refreshUrl = `${CONFIG.appUrl}/api/refresh-token`;
    const secretKey = getSecretKey();

    console.log(`[${timestamp}] Sending request to ${refreshUrl}...`);

    const response = await fetch(refreshUrl, {
      method: "GET",
      headers: {
        "X-Refresh-Secret": secretKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      if (data.refreshed > 0) {
        console.log(
          `[${timestamp}] Refreshed ${data.refreshed} tokens successfully`
        );
      } else {
        console.log(`[${timestamp}] No tokens needed refreshing`);
      }
    } else {
      console.error(`[${timestamp}] Token refresh failed:`, data.message);
    }
  } catch (error) {
    console.error(
      `[${timestamp}] Error in token refresh script:`,
      error.message
    );
  }
}

// Start the refresh service
async function startRefreshService() {
  console.log(`
╔════════════════════════════════════════════════════╗
║                TOKEN REFRESH SERVICE                ║
╠════════════════════════════════════════════════════╣
║ • App URL:      ${CONFIG.appUrl.padEnd(36)} ║
║ • Interval:     ${(CONFIG.refreshInterval / 1000 / 60).toFixed(
    1
  )} minutes${" ".repeat(29)} ║
║ • Secret Path:  ${
    CONFIG.secretPath.length > 36
      ? CONFIG.secretPath.substring(0, 33) + "..."
      : CONFIG.secretPath.padEnd(36)
  } ║
╚════════════════════════════════════════════════════╝
`);

  // Wait for server to be ready when using concurrently
  if (process.env.NODE_ENV !== "production" && CONFIG.startupDelay > 0) {
    console.log(
      `[INFO] Waiting ${
        CONFIG.startupDelay / 1000
      } seconds before starting (to allow server to initialize)...`
    );
    await new Promise((resolve) => setTimeout(resolve, CONFIG.startupDelay));
  }

  // Initial refresh on startup
  console.log("[INFO] Starting token refresh service...");

  try {
    await refreshTokens();
  } catch (err) {
    console.error("[ERROR] Initial refresh failed:", err);
  }

  // Schedule refreshes at the specified interval
  console.log(
    `[INFO] Setting interval to check every ${
      CONFIG.refreshInterval / 1000
    } seconds`
  );
  setInterval(refreshTokens, CONFIG.refreshInterval);

  console.log("[INFO] Token refresh service is running...");
}

// Main execution
console.log("[INFO] Token refresh script starting...");

// Start the service
startRefreshService().catch((error) => {
  console.error("[ERROR] Failed to start refresh service:", error);
});

// Keep the process alive
process.stdin.resume();

// Handle termination signals
process.on("SIGINT", () => {
  console.log("[INFO] Token refresh service terminated");
  process.exit(0);
});
