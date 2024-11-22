import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { signInSchema, signUpSchema } from "@/features/auth/schema";
import { createAdminClient } from "@/lib/appwrite";
import { ID, Permission, Query, Role } from "node-appwrite";
import { deleteCookie, setCookie } from "hono/cookie";
import { AUTH_COOKIE } from "../constant";
import { sessionMiddleware } from "@/lib/session-middleware";
import {
  DATABASE_ID,
  MEMBERS_ID,
  PROJECTS_ID,
  TASKS_ID,
  USER_PAYMENT_STATUS_ID,
  WORKSPACES_ID,
} from "@/config";
import { PaymentStatus } from "@/features/pricing/types";
import { Member } from "@/features/members/types";
import { Workspace } from "@/features/workspaces/types";
import { Task } from "@/features/tasks/types";
import { Project } from "@/features/projects/types";

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
      // httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30,
    });

    return c.json({ success: true });
  })
  .post("/sign-up", zValidator("json", signUpSchema), async (c) => {
    const { name, email, password } = c.req.valid("json");

    const { account, databases, users } = await createAdminClient();

    const existingUsers = await users.list([Query.equal("email", email)]);
    if (existingUsers.total > 0) {
      return c.json({ error: "User already exists with this email" }, 409);
    }

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
      // httpOnly: true,
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
  })
  .get("/attached-with", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    // get all workspaces information where the current user added
    const memberOfWorkspace = await databases.listDocuments<Member>(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal("userId", user.$id)],
    );
    const workspaceIds = memberOfWorkspace.documents.map((m) => m.workspaceId);
    let workspaces;

    if (workspaceIds.length) {
      workspaces = await databases.listDocuments<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        [Query.contains("$id", workspaceIds)],
      );
    }

    // get all projects information where the current user added
    const tasks = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID, [
      Query.equal("assigneeId", user.$id),
    ]);
    const uniqueProjectIds = Array.from(
      new Set(tasks.documents.map((doc) => doc.projectId)),
    );

    let projects;
    if (uniqueProjectIds.length) {
      projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        [Query.contains("$id", uniqueProjectIds)],
      );
    }

    return c.json({
      data: {
        workspaces: workspaces?.documents ?? [],
        workspaceIds,
        projects: projects?.documents ?? [],
        projectIds: uniqueProjectIds,
      },
    });
  });
export default app;
