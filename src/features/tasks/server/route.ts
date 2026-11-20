import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
} from "drizzle-orm";
import {
  BulkUpdateTaskReqSchema,
  createTaskSchema,
  getTaskSchema,
} from "../schema";
import { getMember } from "@/features/members/utils";
import { db } from "@/db";
import { members, notifications, projects, tasks } from "@/db/schema";
import { toDocument } from "@/db/mappers";
import { createId } from "@/lib/id";
import { getClerkUsersByIds } from "@/lib/clerk-user";
import { PopulatedTask, Task, TaskStatus } from "../types";
import { getIsAdmin, getIsOwner } from "@/features/auth/server/queries";

const mapTask = (row: typeof tasks.$inferSelect): Task => {
  const doc = toDocument(row);
  return {
    ...doc,
    name: row.name,
    status: row.status as TaskStatus,
    assigneeId: row.assigneeId,
    projectId: row.projectId,
    workspaceId: row.workspaceId,
    position: row.position,
    dueDate: row.dueDate ? row.dueDate.toISOString() : "",
    description: row.description ?? undefined,
    $id: row.id,
  };
};

const mapProjectCompat = (row: typeof projects.$inferSelect) => ({
  ...toDocument(row),
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
});

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", getTaskSchema),
    async (c) => {
      const user = c.get("user");
      const {
        workspaceId,
        projectId,
        status,
        assigneeId,
        search,
        dueDate,
        limit,
      } = c.req.valid("query");

      const member = await getMember({
        workspaceId,
        userId: user.$id,
      });
      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const conditions = [eq(tasks.workspaceId, workspaceId)];
      if (projectId) conditions.push(eq(tasks.projectId, projectId));
      if (status) conditions.push(eq(tasks.status, status));
      if (assigneeId) conditions.push(eq(tasks.assigneeId, assigneeId));
      if (dueDate) conditions.push(eq(tasks.dueDate, new Date(dueDate)));
      if (search) conditions.push(ilike(tasks.name, `%${search}%`));

      let query = db
        .select()
        .from(tasks)
        .where(and(...conditions))
        .orderBy(desc(tasks.createdAt))
        .$dynamic();

      if (limit) query = query.limit(Number(limit));

      const taskRows = await query;

      if (!taskRows.length) {
        return c.json({ data: { documents: [], total: 0 } });
      }

      const projectIds = Array.from(
        new Set(taskRows.map((task) => task.projectId)),
      );
      const assigneeIds = Array.from(
        new Set(taskRows.map((task) => task.assigneeId)),
      );

      const projectRows = projectIds.length
        ? await db.select().from(projects).where(inArray(projects.id, projectIds))
        : [];

      const memberRows = assigneeIds.length
        ? await db
            .select()
            .from(members)
            .where(
              and(
                eq(members.workspaceId, workspaceId),
                inArray(members.userId, assigneeIds),
              ),
            )
        : [];

      const clerkUsers = await getClerkUsersByIds(assigneeIds);

      const populatedTasks = taskRows.map<PopulatedTask>((task) => {
        const project = projectRows.find((p) => p.id === task.projectId);
        const assigneeUser = clerkUsers.find((u) => u.id === task.assigneeId);
        const assigneeMember = memberRows.find(
          (m) => m.userId === task.assigneeId,
        );

        return {
          ...mapTask(task),
          project: {
            name: project?.name || "",
            imageUrl: project?.imageUrl ?? undefined,
            $id: project?.id || task.projectId,
          },
          assignee: {
            name: assigneeUser?.name || assigneeUser?.email || "Unknown",
            email: assigneeUser?.email || "",
            $id: assigneeMember?.userId || task.assigneeId,
          },
        };
      });

      return c.json({
        data: { documents: populatedTasks, total: populatedTasks.length },
      });
    },
  )
  .get("/:taskId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { taskId } = c.req.param();

    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      return c.json({ error: "Task not found" }, 404);
    }

    const currentUser = await getMember({
      workspaceId: task.workspaceId,
      userId: user.$id,
    });
    if (!currentUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, task.projectId))
      .limit(1);

    const [member] = await db
      .select()
      .from(members)
      .where(
        and(
          eq(members.userId, task.assigneeId),
          eq(members.workspaceId, task.workspaceId),
        ),
      )
      .limit(1);

    const [userInfo] = await getClerkUsersByIds([task.assigneeId]);

    const assignee = {
      ...(member ? toDocument(member) : { $id: task.assigneeId }),
      userId: task.assigneeId,
      name: userInfo?.name || userInfo?.email || "Unknown",
      email: userInfo?.email || "",
    };

    return c.json({
      data: {
        ...mapTask(task),
        project: project
          ? mapProjectCompat(project)
          : {
              $id: task.projectId,
              name: "",
              userId: "",
              workspaceId: task.workspaceId,
            },
        assignee,
      },
    });
  })
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createTaskSchema),
    async (c) => {
      const user = c.get("user");
      const {
        name,
        status,
        workspaceId,
        projectId,
        dueDate,
        assigneeId,
        description,
      } = c.req.valid("json");

      const member = await getMember({
        workspaceId,
        userId: user.$id,
      });
      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const isAdmin = await getIsAdmin(workspaceId, user.$id).catch(() => false);
      const isOwner = await getIsOwner(user.$id, workspaceId);

      if (!isAdmin && !isOwner) {
        return c.json(
          {
            error:
              "Unauthorized. Only admin or owner can assign task to the members.",
          },
          401,
        );
      }

      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

      if (!project) {
        return c.json({ error: "Project not found" }, 404);
      }

      const [highest] = await db
        .select()
        .from(tasks)
        .where(
          and(eq(tasks.status, status), eq(tasks.workspaceId, workspaceId)),
        )
        .orderBy(asc(tasks.position))
        .limit(1);

      const newPosition = highest ? highest.position + 1000 : 1000;
      const taskId = createId();

      const [task] = await db
        .insert(tasks)
        .values({
          id: taskId,
          name,
          status,
          workspaceId,
          projectId,
          dueDate: dueDate ? new Date(dueDate) : null,
          assigneeId,
          position: newPosition,
          description,
        })
        .returning();

      if (user.$id !== assigneeId) {
        await db.insert(notifications).values({
          id: createId(),
          workspaceId,
          projectId,
          to: assigneeId,
          taskId,
          message: `${user.name} assigned you to a task, named ${name} in ${project.name} project`,
          link: `/dashboard/workspaces/${workspaceId}/projects/${projectId}`,
        });
      }

      return c.json({ data: mapTask(task) });
    },
  )
  .post(
    "/bulk-update",
    sessionMiddleware,
    zValidator("json", BulkUpdateTaskReqSchema),
    async (c) => {
      const user = c.get("user");
      const { tasks: taskUpdates } = c.req.valid("json");

      const taskIds = taskUpdates.map((t) => t.$id);
      const existing = await db
        .select()
        .from(tasks)
        .where(inArray(tasks.id, taskIds));

      const workspaceIds = new Set(existing.map((t) => t.workspaceId));
      if (workspaceIds.size !== 1) {
        return c.json(
          { error: "All tasks must be belong to the same workspace" },
          409,
        );
      }

      const workspaceId = workspaceIds.values().next().value!;
      const member = await getMember({
        workspaceId,
        userId: user.$id,
      });
      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const updatedTasks = await Promise.all(
        taskUpdates.map(async (task) => {
          const [updated] = await db
            .update(tasks)
            .set({
              status: task.status,
              position: task.position,
              updatedAt: new Date(),
            })
            .where(eq(tasks.id, task.$id))
            .returning();
          return mapTask(updated);
        }),
      );

      return c.json({ data: updatedTasks });
    },
  )
  .patch(
    "/:taskId",
    sessionMiddleware,
    zValidator("json", createTaskSchema.partial()),
    async (c) => {
      const user = c.get("user");
      const { name, status, projectId, dueDate, assigneeId, description } =
        c.req.valid("json");
      const { taskId } = c.req.param();

      const [existingTask] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);

      if (!existingTask) {
        return c.json({ error: "Task not found" }, 404);
      }

      const member = await getMember({
        workspaceId: existingTask.workspaceId,
        userId: user.$id,
      });
      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const isAdmin = await getIsAdmin(
        existingTask.workspaceId,
        user.$id,
      ).catch(() => false);
      const isOwner = await getIsOwner(user.$id, existingTask.workspaceId);

      if (!isAdmin && !isOwner) {
        return c.json(
          {
            error:
              "Unauthorized. Only admin or owner can assign task to the members.",
          },
          401,
        );
      }

      const [task] = await db
        .update(tasks)
        .set({
          name,
          status,
          projectId,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          assigneeId,
          description,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, taskId))
        .returning();

      if (
        assigneeId &&
        existingTask.assigneeId !== assigneeId &&
        assigneeId !== user.$id
      ) {
        const targetProjectId = projectId || existingTask.projectId;
        const [project] = await db
          .select()
          .from(projects)
          .where(eq(projects.id, targetProjectId))
          .limit(1);

        const existingNotifications = await db
          .select()
          .from(notifications)
          .where(eq(notifications.taskId, existingTask.id));

        if (existingNotifications[0]) {
          await db
            .delete(notifications)
            .where(eq(notifications.id, existingNotifications[0].id));
        }

        await db.insert(notifications).values({
          id: createId(),
          workspaceId: existingTask.workspaceId,
          projectId: targetProjectId,
          to: assigneeId,
          message: `${user.name} assigned you to a task named ${name} in ${project?.name} project`,
        });

        await db.insert(notifications).values({
          id: createId(),
          workspaceId: existingTask.workspaceId,
          projectId: targetProjectId,
          to: existingTask.assigneeId,
          message: `${user.name} removed you from a task named ${name} in ${project?.name} project`,
        });
      }

      return c.json({ data: mapTask(task) });
    },
  )
  .delete("/:taskId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { taskId } = c.req.param();

    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      return c.json({ error: "Task not found" }, 404);
    }

    const member = await getMember({
      workspaceId: task.workspaceId,
      userId: user.$id,
    });
    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const isAdmin = await getIsAdmin(task.workspaceId, user.$id).catch(
      () => false,
    );
    const isOwner = await getIsOwner(user.$id, task.workspaceId);

    if (!isAdmin && !isOwner) {
      return c.json(
        {
          error:
            "Unauthorized. Only admin or owner can assign task to the members.",
        },
        401,
      );
    }

    await db.delete(tasks).where(eq(tasks.id, taskId));
    await db.delete(notifications).where(eq(notifications.taskId, taskId));

    return c.json({ data: { $id: task.id } });
  });

export default app;
