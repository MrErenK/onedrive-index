import { ActionFunctionArgs } from "@remix-run/node";
import { verifyAdminPassword as verifyPassword } from "~/utils/password";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const password = authHeader.slice(7); // Remove "Bearer " prefix
    if (!password) {
      return new Response(JSON.stringify({ error: "Password is required" }), {
        status: 400,
      });
    }

    const isValid = verifyPassword(password);
    if (!isValid) {
      return new Response("Invalid password", { status: 401 });
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Password verification error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
