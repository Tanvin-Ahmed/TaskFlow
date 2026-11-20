import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { and, count, desc, eq, gte, inArray, lt, lte, ne } from "drizzle-orm";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { z } from "zod";
import { updateWorkspaceSchema, workspaceSchema } from "../schema";
import { sessionMiddleware } from "@/lib/session-middleware";
import { db } from "@/db";
import {
  members,
  projects,
  tasks,
  userPaymentStatus,
  workspaces,
} from "@/db/schema";
import { toDocument, toList } from "@/db/mappers";
import { createId } from "@/lib/id";
import { MemberRole } from "@/features/members/types";
import { generateInviteCode } from "@/lib/utils";
import { getMember } from "@/features/members/utils";
import { TaskStatus } from "@/features/tasks/types";
import { PaymentStatus } from "@/features/pricing/types";
import { DEFAULT_VALUES } from "@/constant/values";

const app = new Hono()
  .get("/", sessionMiddleware, async (c) => {
    const user = c.get("user");

    const memberships = await db
      .select()
      .from(members)
      .where(eq(members.userId, user.$id));

    if (!memberships.length) {
      return c.json({ data: { documents: [], total: 0 } });
    }

    const workspaceIds = memberships.map((doc) => doc.workspaceId);
    const rows = await db
      .select()
      .from(workspaces)
      .where(inArray(workspaces.id, workspaceIds))
      .orderBy(desc(workspaces.createdAt));

    return c.json({ data: toList(rows) });
  })
  .get("/:workspaceId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    const member = await getMember({
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (!workspace) {
      return c.json({ error: "Workspace not found" }, 404);
    }

    return c.json({ data: toDocument(workspace) });
  })
  .get("/:projectId/workspace", sessionMiddleware, async (c) => {
    const { projectId } = c.req.param();

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    return c.json({ data: project.workspaceId });
  })
  .get("/:workspaceId/analytics", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    const member = await getMember({
      workspaceId,
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
        eq(tasks.workspaceId, workspaceId),
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
          eq(tasks.workspaceId, workspaceId),
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
          eq(tasks.workspaceId, workspaceId),
          ne(tasks.status, TaskStatus.DONE),
          lt(tasks.dueDate, now),
          gte(tasks.createdAt, lastMonthStart),
          lte(tasks.createdAt, lastMonthEnd),
        ),
      );

    const overdueTaskCount = Number(overdueThis[0]?.value ?? 0);
    const lastOverdue = Number(overdueLast[0]?.value ?? 0);

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
        overdueTaskCount,
        overdueTaskDifference: overdueTaskCount - lastOverdue,
      },
    });
  })
  .get("/:workspaceId/isAdmin", sessionMiddleware, async (c) => {
    const { workspaceId } = c.req.param();
    const user = c.get("user");

    const member = await getMember({
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    return c.json({ isAdmin: member.role === MemberRole.ADMIN });
  })
  .get("/:workspaceId/isOwner", sessionMiddleware, async (c) => {
    const { workspaceId } = c.req.param();
    const user = c.get("user");

    const member = await getMember({
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [workspaceInfo] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    return c.json({ isOwner: workspaceInfo?.userId === user.$id });
  })
  .post(
    "/",
    zValidator("form", workspaceSchema),
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const { name } = c.req.valid("form");
      const workspaceId = createId();

      const [workspace] = await db
        .insert(workspaces)
        .values({
          id: workspaceId,
          name,
          userId: user.$id,
          inviteCode: generateInviteCode(8),
        })
        .returning();

      await db.insert(members).values({
        id: createId(),
        userId: user.$id,
        workspaceId,
        role: MemberRole.ADMIN,
      });

      return c.json({ data: toDocument(workspace) });
    },
  )
  .post("/:workspaceId/reset-invite-code", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    const member = await getMember({
      workspaceId,
      userId: user.$id,
    });

    if (!member || member.role !== MemberRole.ADMIN) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [workspace] = await db
      .update(workspaces)
      .set({
        inviteCode: generateInviteCode(8),
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, workspaceId))
      .returning();

    return c.json({ data: toDocument(workspace) });
  })
  .post(
    "/:workspaceId/join",
    sessionMiddleware,
    zValidator("json", z.object({ code: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.param();
      const { code } = c.req.valid("json");
      const user = c.get("user");

      const member = await getMember({
        workspaceId,
        userId: user.$id,
      });

      if (member) {
        return c.json({ error: "Already a member" }, 409);
      }

      const [workspace] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .limit(1);

      if (!workspace) {
        return c.json({ error: "Workspace not found" }, 404);
      }

      if (!workspace.inviteCode || workspace.inviteCode !== code) {
        return c.json({ error: "Invalid invite code" }, 400);
      }

      let enforceMemberLimit = true;
      const [creator] = await db
        .select()
        .from(userPaymentStatus)
        .where(eq(userPaymentStatus.userId, workspace.userId))
        .limit(1);

      if (creator?.paymentStatus === PaymentStatus.Pro) {
        enforceMemberLimit = false;
      }

      if (enforceMemberLimit) {
        const [memberCount] = await db
          .select({ value: count() })
          .from(members)
          .where(eq(members.workspaceId, workspaceId));

        if (
          Number(memberCount?.value ?? 0) >=
          DEFAULT_VALUES.FREE_VERSION_MEMBER_COUNT_PER_WORKSPACE
        ) {
          return c.json({ error: "User limit exceeded" }, 400);
        }
      }

      await db.insert(members).values({
        id: createId(),
        workspaceId,
        userId: user.$id,
        role: MemberRole.MEMBER,
      });

      return c.json({ data: toDocument(workspace) });
    },
  )
  .patch(
    "/:workspaceId",
    zValidator("form", updateWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const { workspaceId } = c.req.param();
      const { name } = c.req.valid("form");

      const member = await getMember({
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [workspace] = await db
        .update(workspaces)
        .set({
          name,
          updatedAt: new Date(),
        })
        .where(eq(workspaces.id, workspaceId))
        .returning();

      return c.json({ data: toDocument(workspace) });
    },
  )
  .delete("/:workspaceId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    const member = await getMember({
      workspaceId,
      userId: user.$id,
    });

    if (!member || member.role !== MemberRole.ADMIN) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Cascades handle members/projects/tasks/notifications via FK
    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));

    return c.json({ data: { $id: workspaceId } }, 200);
  });

export default app;
