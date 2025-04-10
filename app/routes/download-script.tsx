import { LoaderFunctionArgs } from "@remix-run/node";
import { requireAuth } from "~/utils/auth.server";
import { generateUploadScript } from "~/utils/cli-script-template";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);

  const url = new URL(request.url);
  const isLocalhost =
    url.hostname === "localhost" || url.hostname === "127.0.0.1";

  // Use HTTP for localhost, HTTPS for all other domains
  const protocol = isLocalhost ? "http:" : "https:";
  const serverUrl = `${protocol}//${url.host}`;

  const script = generateUploadScript(serverUrl);

  return new Response(script, {
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": 'attachment; filename="onedrive-upload.sh"',
    },
  });
}
