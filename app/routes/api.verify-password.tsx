import { ActionFunctionArgs } from "@remix-run/node";

function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("ADMIN_PASSWORD environment variable not set");
    return false;
  }
  return password === adminPassword;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { password } = await request.json();

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
