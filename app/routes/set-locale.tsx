import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { languageCookie } from "~/utils/cookie.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const locale = formData.get("locale");

  if (typeof locale !== "string") {
    return redirect("/");
  }

  return redirect(request.headers.get("Referer") || "/", {
    headers: {
      "Set-Cookie": await languageCookie.serialize(locale),
    },
  });
}
