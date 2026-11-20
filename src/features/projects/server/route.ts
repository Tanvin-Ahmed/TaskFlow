import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { and, count, desc, eq, gte, lt, lte, ne } from "drizzle-orm";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { createProjectSchema, updateProjectSchema } from "../schema";
import { TaskStatus } from "@/features/tasks/types";
import { getIsOwner } from "@/features/auth/server/queries";
import { getAssignees } from "./action";
import { liveblocks } from "@/features/live-block/server/route";
import { db } from "@/db";
import { notifications, projects, tasks } from "@/db/schema";
import { toDocument } from "@/db/mappers";
import { createId } from "@/lib/id";
import { getClerkUsersByIds } from "@/lib/clerk-user";

const serializeDocPermissions = (
  value: string | string[] | null | undefined,
) => {
  if (!value) return null;
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const mapProject = (row: typeof projects.$inferSelect) => {
  const doc = toDocument(row);
  return {
    ...doc,
    name: row.name,
    workspaceId: row.workspaceId,
    userId: row.userId,
    imageUrl: row.imageUrl ?? undefined,
    imageId: row.imageId ?? undefined,
    docs: row.docs ?? undefined,
    canvas: row.canvas ?? undefined,
    isDocCreated: row.isDocCreated ?? undefined,
    docPermissionMemberList: row.docPermissionMemberList
      ? JSON.stringify(row.docPermissionMemberList)
      : undefined,
    $id: row.id,
  };
};

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({ workspaceId: z.string(), limit: z.string().nullish() }),
    ),
    async (c) => {
      const user = c.get("user");
      const { workspaceId, limit } = c.req.valid("query");

      const member = await getMember({
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      let query = db
        .select()
        .from(projects)
        .where(eq(projects.workspaceId, workspaceId))
        .orderBy(desc(projects.createdAt))
        .$dynamic();

      if (limit) query = query.limit(Number(limit));

      const rows = await query;
      return c.json({
        data: {
          documents: rows.map(mapProject),
          total: rows.length,
        },
      });
    },
  )
  .get("/:projectId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { projectId } = c.req.param();

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    const member = await getMember({
      workspaceId: project.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    return c.json({ data: mapProject(project) });
  })
  .get("/:projectId/analytics", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { projectId } = c.req.param();

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    const member = await getMember({
      workspaceId: project.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const countTasks = async (
      extra: ReturnType<typeof and> | undefined,
      from: Date,
      to: Date,
    ) => {
      const conditions = [
        eq(tasks.projectId, projectId),
        gte(tasks.createdAt, from),
        lte(tasks.createdAt, to),
      ];
      if (extra) conditions.push(extra);
      const [result] = await db
        .select({ value: count() })
        .from(tasks)
        .where(and(...conditions));
      return Number(result?.value ?? 0);
    };

    const taskCount = await countTasks(undefined, thisMonthStart, thisMonthEnd);
    const lastMonthTaskCount = await countTasks(
      undefined,
      lastMonthStart,
      lastMonthEnd,
    );

    const assignedCond = eq(tasks.assigneeId, user.$id);
    const assignedTaskCount = await countTasks(
      assignedCond,
      thisMonthStart,
      thisMonthEnd,
    );
    const lastAssigned = await countTasks(
      assignedCond,
      lastMonthStart,
      lastMonthEnd,
    );

    const incompleteCond = ne(tasks.status, TaskStatus.DONE);
    const incompleteTaskCount = await countTasks(
      incompleteCond,
      thisMonthStart,
      thisMonthEnd,
    );
    const lastIncomplete = await countTasks(
      incompleteCond,
      lastMonthStart,
      lastMonthEnd,
    );

    const completedCond = eq(tasks.status, TaskStatus.DONE);
    const completedTaskCount = await countTasks(
      completedCond,
      thisMonthStart,
      thisMonthEnd,
    );
    const lastCompleted = await countTasks(
      completedCond,
      lastMonthStart,
      lastMonthEnd,
    );

    const overdueThis = await db
      .select({ value: count() })
      .from(tasks)
      .where(
        and(
          eq(tasks.projectId, projectId),
          ne(tasks.status, TaskStatus.DONE),
          lt(tasks.dueDate, now),
          gte(tasks.createdAt, thisMonthStart),
          lte(tasks.createdAt, thisMonthEnd),
        ),
      );
    const overdueLast = await db
      .select({ value: count() })
      .from(tasks)
      .where(
        and(
          eq(tasks.projectId, projectId),
          ne(tasks.status, TaskStatus.DONE),
          lt(tasks.dueDate, now),
          gte(tasks.createdAt, lastMonthStart),
          lte(tasks.createdAt, lastMonthEnd),
        ),
      );

    return c.json({
      data: {
        taskCount,
        taskDifference: taskCount - lastMonthTaskCount,
        assignedTaskCount,
        assignedTaskDifference: assignedTaskCount - lastAssigned,
        completedTaskCount,
        completedTaskDifference: completedTaskCount - lastCompleted,
        incompleteTaskCount,
        incompleteTaskDifference: incompleteTaskCount - lastIncomplete,
        overdueTaskCount: Number(overdueThis[0]?.value ?? 0),
        overdueTaskDifference:
          Number(overdueThis[0]?.value ?? 0) -
          Number(overdueLast[0]?.value ?? 0),
      },
    });
  })
  .get("/:projectId/assignees", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { projectId } = c.req.param();

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    const member = await getMember({
      workspaceId: project.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const taskRows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId));

    const assigneeIds = Array.from(
      new Set(taskRows.map((doc) => doc.assigneeId)),
    );
    const users = await getClerkUsersByIds(assigneeIds);

    return c.json({ data: users });
  })
  .post(
    "/",
    sessionMiddleware,
    zValidator("form", createProjectSchema),
    async (c) => {
      const user = c.get("user");
      const { name, workspaceId } = c.req.valid("form");

      const workspaceMember = await getMember({
        workspaceId,
        userId: user.$id,
      });
      if (!workspaceMember) {
        return c.json(
          {
            error: "Unauthorized. Only workspace owner can create new project.",
          },
          401,
        );
      }

      const isOwner = await getIsOwner(user.$id, workspaceId);
      if (!isOwner) {
        return c.json(
          {
            error: "Unauthorized. Only workspace owner can create new project.",
          },
          401,
        );
      }

      const [project] = await db
        .insert(projects)
        .values({
          id: createId(),
          name,
          workspaceId,
          userId: user.$id,
        })
        .returning();

      return c.json({ data: mapProject(project) });
    },
  )
  .patch(
    "/:projectId",
    zValidator("form", updateProjectSchema),
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const { projectId } = c.req.param();
      const { name, docs, canvas, isDocCreated, docPermissionMemberList } =
        c.req.valid("form");

      const [existingProject] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

      if (!existingProject) {
        return c.json({ error: "Project not found" }, 404);
      }

      const member = await getMember({
        workspaceId: existingProject.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const isOwner = await getIsOwner(user.$id, existingProject.workspaceId);
      if (!isOwner) {
        return c.json(
          {
            error: "Unauthorized. Only workspace owner can create new project.",
          },
          401,
        );
      }

      const [project] = await db
        .update(projects)
        .set({
          name,
          docs,
          canvas,
          isDocCreated:
            isDocCreated !== undefined ? Boolean(isDocCreated) : undefined,
          docPermissionMemberList: serializeDocPermissions(
            docPermissionMemberList,
          ),
          updatedAt: new Date(),
        })
        .where(eq(projects.id, projectId))
        .returning();

      return c.json({ data: mapProject(project) });
    },
  )
  .delete("/:projectId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { projectId } = c.req.param();

    const [existingProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!existingProject) {
      return c.json({ error: "Project not found" }, 404);
    }

    const member = await getMember({
      workspaceId: existingProject.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const isOwner = await getIsOwner(user.$id, existingProject.workspaceId);
    if (!isOwner) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const assignees = await getAssignees(projectId);

    if (Boolean(existingProject.isDocCreated)) {
      await liveblocks.deleteRoom(projectId);
    }

    await db.delete(tasks).where(eq(tasks.projectId, projectId));
    await db
      .delete(notifications)
      .where(eq(notifications.projectId, projectId));
    await db.delete(projects).where(eq(projects.id, projectId));

    if (assignees.length > 0) {
      await Promise.all(
        assignees.map((assignee) =>
          db.insert(notifications).values({
            id: createId(),
            workspaceId: existingProject.workspaceId,
            to: assignee.$id,
            message: `${existingProject.name} is deleted by ${user.name}.`,
          }),
        ),
      );
    }

    return c.json(
      {
        data: {
          $id: projectId,
          workspaceId: existingProject.workspaceId,
        },
      },
      200,
    );
  });

export default app;
