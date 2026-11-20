import { createMiddleware } from "hono/factory";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import type { Database } from "@/db";
import type { AppUser } from "@/types/auth";

type AdditionalContext = {
  Variables: {
    db: Database;
    user: AppUser;
  };
};

export const sessionMiddleware = createMiddleware<AdditionalContext>(
  async (c, next) => {
    const { userId } = auth();

    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const email =
      clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      "";

    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      email;

    const user: AppUser = {
      $id: clerkUser.id,
      name,
      email,
      imageUrl: clerkUser.imageUrl,
    };

    c.set("user", user);
    c.set("db", db);

    await next();
  },
);
