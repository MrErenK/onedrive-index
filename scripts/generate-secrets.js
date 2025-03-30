import crypto from "crypto";
import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import readline from "readline";
import process from "process";

const __filename = fileURLToPath(import.meta.url);
const rootDir = dirname(dirname(__filename));

// Function to generate a secure random string
function generateSecureString(length = 32) {
  return crypto.randomBytes(length).toString("hex");
}

// Function to generate a random password with specific characteristics
function generatePassword(length = 16) {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%^&*_-+=";

  const allChars = uppercase + lowercase + numbers + symbols;
  let password = "";

  // Ensure at least one character from each group
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));

  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

// Create an interface for reading from the console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Ask a question and get user input
function askQuestion(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

// Check if .env file exists and create if not
function ensureEnvFile() {
  const envPath = join(rootDir, ".env");
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, "# OneDrive Explorer Environment Variables\n\n");
    console.log("Created new .env file");
  }
  return envPath;
}

// Update .env file with new values
function updateEnvFile(key, value) {
  const envPath = ensureEnvFile();
  let envContent = fs.readFileSync(envPath, "utf8");

  // Check if key already exists
  const regex = new RegExp(`^${key}=.*$`, "m");
  if (regex.test(envContent)) {
    // Replace existing value
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    // Add new key-value pair
    envContent += `${key}=${value}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log(`Updated ${key} in .env file`);
}

async function main() {
  console.log("\n==== OneDrive Explorer Secrets Generator ====\n");

  // Generate and save SESSION_SECRET
  const sessionSecret = generateSecureString(64);
  updateEnvFile("SESSION_SECRET", sessionSecret);
  console.log("✅ Generated SESSION_SECRET");

  // For APP_PASSWORD, ask if user wants to set their own or generate one
  const passwordChoice = await askQuestion(
    "Do you want to set your own APP_PASSWORD or generate one? (own/generate): "
  );

  let appPassword;
  if (passwordChoice.toLowerCase() === "own") {
    appPassword = await askQuestion(
      "Enter your password (min 8 characters, leave blank to generate): "
    );
    if (!appPassword || appPassword.length < 8) {
      console.log("⚠️ Invalid or short password, generating one instead");
      appPassword = generatePassword(16);
    }
  } else {
    appPassword = generatePassword(16);
  }

  updateEnvFile("APP_PASSWORD", appPassword);
  console.log("✅ APP_PASSWORD set successfully");

  // Generate refresh token secret
  const refreshSecret = generateSecureString(32);
  const refreshSecretPath = join(rootDir, ".refresh-secret");
  fs.writeFileSync(refreshSecretPath, refreshSecret);
  console.log(`✅ Created refresh secret at ${refreshSecretPath}`);

  console.log("\n==== Secret Generation Complete ====");
  console.log(
    "\n⭐ Important: Keep these secrets safe and never commit them to version control!"
  );
  console.log(`\nYour application password is: ${appPassword}`);
  console.log("\nYou will need this password to log in to the application.\n");

  rl.close();
}

main().catch((err) => {
  console.error("Error generating secrets:", err);
  process.exit(1);
});
