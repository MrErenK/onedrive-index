import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getCurrentSession } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getCurrentSession();

  if (session) {
    // User is logged in, redirect to files
    return redirect("/files");
  }

  // Not logged in, redirect to login
  return redirect("/login");
}

export default function Index() {
  // This component will never be rendered due to redirects
  return null;
}
