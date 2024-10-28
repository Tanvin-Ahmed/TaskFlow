import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { signInSchema, signUpSchema } from "@/features/auth/schema";
import { createAdminClient } from "@/lib/appwrite";
import { ID, Permission, Role } from "node-appwrite";
import { deleteCookie, setCookie } from "hono/cookie";
import { AUTH_COOKIE } from "../constant";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, USER_PAYMENT_STATUS_ID } from "@/config";
import { PaymentStatus } from "@/features/pricing/types";

const app = new Hono()
  .get("/current", sessionMiddleware, async (c) => {
    const user = c.get("user");
    return c.json({ data: user });
  })
  .post("/sign-in", zValidator("json", signInSchema), async (c) => {
    const { email, password } = c.req.valid("json"); // we can access values like this when we use zValidator

    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);
    setCookie(c, AUTH_COOKIE, session.secret, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
    });

    return c.json({ success: true });
  })
  .post("/sign-up", zValidator("json", signUpSchema), async (c) => {
    const { name, email, password } = c.req.valid("json");

    const { account, databases } = await createAdminClient();
    const authData = await account.create(ID.unique(), email, password, name);

    await databases.createDocument(
      DATABASE_ID,
      USER_PAYMENT_STATUS_ID,
      ID.unique(),
      {
        userId: authData.$id,
        paymentStatus: PaymentStatus.Normal,
      },
      [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
        Permission.delete(Role.any()),
      ],
    );

    // create payment user info

    const session = await account.createEmailPasswordSession(email, password);

    setCookie(c, AUTH_COOKIE, session.secret, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
    });

    return c.json({ success: true });
  })
  .delete("/logout", sessionMiddleware, async (c) => {
    const account = c.get("account");

    deleteCookie(c, AUTH_COOKIE);
    await account.deleteSession("current");
    return c.json({ success: true });
  });

export default app;
