import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { getMember } from "../utils";
import { db } from "@/db";
import { members, notifications, tasks, workspaces } from "@/db/schema";
import { toDocument } from "@/db/mappers";
import { createId } from "@/lib/id";
import { getClerkUsersByIds } from "@/lib/clerk-user";
import { MemberRole } from "../types";
import { getIsOwner } from "@/features/auth/server/queries";

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
        .from(members)
        .where(eq(members.workspaceId, workspaceId))
        .$dynamic();

      if (limit) {
        query = query.limit(Number(limit));
      }

      const memberRows = await query;
      const clerkUsers = await getClerkUsersByIds(
        memberRows.map((m) => m.userId),
      );

      const populatedMembers = memberRows.map((row) => {
        const clerkUser = clerkUsers.find((u) => u.id === row.userId);
        return {
          ...toDocument(row),
          role: row.role as MemberRole,
          name: clerkUser?.name || clerkUser?.email || "Unknown",
          email: clerkUser?.email || "",
          userId: row.userId,
          workspaceId: row.workspaceId,
        };
      });

      return c.json({
        data: { documents: populatedMembers, total: populatedMembers.length },
      });
    },
  )
  .get(":workspaceId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    const member = await getMember({
      workspaceId,
      userId: user.$id,
    });

    return c.json({ data: !!member?.$id });
  })
  .delete(":memberId", sessionMiddleware, async (c) => {
    const { memberId } = c.req.param();
    const user = c.get("user");

    const [memberToDelete] = await db
      .select()
      .from(members)
      .where(eq(members.id, memberId))
      .limit(1);

    if (!memberToDelete) {
      return c.json({ error: "User not found to delete" }, 400);
    }

    const allMembersInWorkspace = await db
      .select()
      .from(members)
      .where(eq(members.workspaceId, memberToDelete.workspaceId));

    const member = await getMember({
      workspaceId: memberToDelete.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (member.$id !== memberToDelete.id && member.role !== MemberRole.ADMIN) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (allMembersInWorkspace.length === 1) {
      return c.json({ error: "Cannot delete the only member" }, 400);
    }

    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, memberToDelete.workspaceId))
      .limit(1);

    if (!workspace) {
      return c.json({ error: "Workspace not found" }, 404);
    }

    if (workspace.userId === memberToDelete.userId) {
      return c.json({ error: "Cannot delete the creator of workspace" }, 400);
    }

    await db
      .delete(tasks)
      .where(
        and(
          eq(tasks.assigneeId, memberToDelete.userId),
          eq(tasks.workspaceId, memberToDelete.workspaceId),
        ),
      );

    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.workspaceId, memberToDelete.workspaceId),
          eq(notifications.to, memberToDelete.userId),
        ),
      );

    await db.delete(members).where(eq(members.id, memberId));

    await db.insert(notifications).values({
      id: createId(),
      workspaceId: workspace.id,
      to: memberToDelete.userId,
      message: `Admin remove you from ${workspace.name} workspace.`,
    });

    return c.json({ data: { $id: memberToDelete.id } });
  })
  .patch(
    ":memberId",
    sessionMiddleware,
    zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })),
    async (c) => {
      const { memberId } = c.req.param();
      const { role } = c.req.valid("json");
      const user = c.get("user");

      const [memberToUpdate] = await db
        .select()
        .from(members)
        .where(eq(members.id, memberId))
        .limit(1);

      if (!memberToUpdate) {
        return c.json({ error: "User not found to delete" }, 400);
      }

      const allMembersInWorkspace = await db
        .select()
        .from(members)
        .where(eq(members.workspaceId, memberToUpdate.workspaceId));

      const member = await getMember({
        workspaceId: memberToUpdate.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized to access" }, 401);
      }

      const isOwner = await getIsOwner(user.$id, memberToUpdate.workspaceId);
      if (!isOwner) {
        return c.json({ error: "Unauthorized to update" }, 401);
      }

      if (allMembersInWorkspace.length === 1) {
        return c.json({ error: "Cannot downgrade the only member" }, 400);
      }

      const [workspace] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, memberToUpdate.workspaceId))
        .limit(1);

      if (!workspace) {
        return c.json({ error: "Workspace not found" }, 404);
      }

      if (workspace.userId === memberToUpdate.userId) {
        return c.json(
          { error: "Cannot downgrade the owner of workspace" },
          400,
        );
      }

      await db
        .update(members)
        .set({ role, updatedAt: new Date() })
        .where(eq(members.id, memberId));

      await db.insert(notifications).values({
        id: createId(),
        workspaceId: workspace.id,
        message:
          role === MemberRole.ADMIN
            ? `${workspace.name} workspace owner make you an admin of this workspace.`
            : `${workspace.name} workspace owner downgrade you to the general member of this workspace.`,
        to: memberToUpdate.userId,
        link: `/workspaces/${workspace.id}/members`,
      });

      return c.json({ data: { $id: memberToUpdate.id } });
    },
  );

export default app;
