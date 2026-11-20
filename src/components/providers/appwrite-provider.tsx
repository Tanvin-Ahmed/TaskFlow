"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { client } from "@/lib/appwrite-client";
import { AUTH_COOKIE } from "@/features/auth/constant";

/**
 * Keeps the browser Appwrite SDK in sync with the server session cookie
 * so realtime subscriptions (e.g. notifications) are authenticated.
 */
export default function AppwriteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const session = Cookies.get(AUTH_COOKIE);
    if (session) {
      client.setSession(session);
    }
  }, []);

  return <>{children}</>;
}
