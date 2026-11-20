"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { OAuthProvider } from "node-appwrite";
import { createAdminClient } from "./appwrite";

function getRequestOrigin() {
  const headerStore = headers();
  const origin = headerStore.get("origin");
  if (origin) return origin.replace(/\/$/, "");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (appUrl) return appUrl;

  const host =
    headerStore.get("x-forwarded-host") || headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;

  throw new Error(
    "Unable to determine app origin for OAuth. Set NEXT_PUBLIC_APP_URL=https://task-flow-brown.vercel.app in Vercel.",
  );
}

export async function signUpWithGithub() {
  const { account } = await createAdminClient();
  const origin = getRequestOrigin();

  const redirectUrl = await account.createOAuth2Token(
    OAuthProvider.Github,
    `${origin}/oauth`,
    `${origin}/sign-up`,
  );

  return redirect(redirectUrl);
}

export async function signUpWithGoogle() {
  const { account } = await createAdminClient();
  const origin = getRequestOrigin();

  const redirectUrl = await account.createOAuth2Token(
    OAuthProvider.Google,
    `${origin}/oauth`,
    `${origin}/sign-up`,
  );

  return redirect(redirectUrl);
}
