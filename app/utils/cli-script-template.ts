import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

interface ScriptOptions {
  templatePath?: string;
}

export function generateUploadScript(
  serverUrl: string,
  options: ScriptOptions = {}
) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const templatePath =
    options.templatePath ||
    path.join(__dirname, "../../public/templates/upload-script.template.sh");

  try {
    let scriptContent = fs.readFileSync(templatePath, "utf8");

    // Replace placeholders with actual values
    scriptContent = scriptContent.replace(/{{SERVER_URL}}/g, serverUrl);

    return scriptContent;
  } catch (error: any) {
    throw new Error(`Failed to generate upload script: ${error.message}`);
  }
}
