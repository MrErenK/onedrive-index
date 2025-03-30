import { createCookie } from "@remix-run/node";

export const languageCookie = createCookie("lng", {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
});

export default languageCookie;
