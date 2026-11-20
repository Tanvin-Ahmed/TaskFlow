import { Hono } from "hono";
import { eq, inArray } from "drizzle-orm";
import { sessionMiddleware } from "@/lib/session-middleware";
import { db } from "@/db";
import { members, projects, tasks, workspaces } from "@/db/schema";
import { toDocument } from "@/db/mappers";

const app = new Hono()
  .get("/current", sessionMiddleware, async (c) => {
    const user = c.get("user");
    return c.json({ data: user });
  })
  .get("/attached-with", sessionMiddleware, async (c) => {
    const user = c.get("user");

    const memberOfWorkspace = await db
      .select()
      .from(members)
      .where(eq(members.userId, user.$id));

    const workspaceIds = memberOfWorkspace.map((m) => m.workspaceId);

    const workspaceRows = workspaceIds.length
      ? await db
          .select()
          .from(workspaces)
          .where(inArray(workspaces.id, workspaceIds))
      : [];

    const assignedTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.assigneeId, user.$id));

    const uniqueProjectIds = Array.from(
      new Set(assignedTasks.map((doc) => doc.projectId)),
    );

    const projectRows = uniqueProjectIds.length
      ? await db
          .select()
          .from(projects)
          .where(inArray(projects.id, uniqueProjectIds))
      : [];

    return c.json({
      data: {
        workspaces: workspaceRows.map(toDocument),
        workspaceIds,
        projects: projectRows.map(toDocument),
        projectIds: uniqueProjectIds,
      },
    });
  });

export default app;
