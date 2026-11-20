import { AppType } from "@/app/api/[[...route]]/route";
import { hc } from "hono/client";

// Use the current origin in the browser so the session cookie is always
// sent to the same host that set it (avoids localhost → Vercel 401s).
const baseUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL!;

export const client = hc<AppType>(baseUrl, {
  init: {
    credentials: "include",
  },
});
