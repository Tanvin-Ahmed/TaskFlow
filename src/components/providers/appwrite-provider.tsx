"use client";

import "@/lib/appwrite-client";

/**
 * Imports the Appwrite web client once on the client so `client.ping()`
 * runs when the app starts and setup can be confirmed.
 */
export default function AppwriteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
