import { AUTH_COOKIE } from "@/features/auth/constant";
import { createAdminClient } from "@/lib/appwrite";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const secret = request.nextUrl.searchParams.get("secret");

  if (!userId || !secret) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  const { account } = await createAdminClient();
  const session = await account.createSession(userId, secret);

  // Cookie must be set on the redirect response; cookies().set() alone
  // is dropped when returning NextResponse.redirect().
  const response = NextResponse.redirect(`${request.nextUrl.origin}/`);
  response.cookies.set(AUTH_COOKIE, session.secret, {
    path: "/",
    // httpOnly: true,
    sameSite: "lax",
    // secure cookies are not sent over http://localhost
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
