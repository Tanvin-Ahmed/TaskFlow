import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { getMember } from "../utils";
import {
  DATABASE_ID,
  MEMBERS_ID,
  NOTIFICATIONS_ID,
  TASKS_ID,
  WORKSPACES_ID,
} from "@/config";
import { ID, Query } from "node-appwrite";
import { Member, MemberRole } from "../types";
import { Workspace } from "@/features/workspaces/types";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId } = c.req.valid("query");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const members = await databases.listDocuments<Member>(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("workspaceId", workspaceId)],
      );

      const populatedMembers = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);

          return {
            ...member,
            role: member.role as MemberRole,
            name: user.name || user.email,
            email: user.email,
          };
        }),
      );

      return c.json({ data: { ...members, documents: populatedMembers } });
    },
  )
  .get(":workspaceId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    return c.json({ data: !!member.$id });
  })
  .delete(":memberId", sessionMiddleware, async (c) => {
    const { memberId } = c.req.param();
    const user = c.get("user");
    const databases = c.get("databases");

    //   check is the member is in database or not
    const memberToDelete = await databases.getDocument<Member>(
      DATABASE_ID,
      MEMBERS_ID,
      memberId,
    );

    if (!memberToDelete) {
      return c.json({ error: "User not found to delete" }, 400);
    }

    const allMembersInWorkspace = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal("workspaceId", memberToDelete.workspaceId)],
    );

    //   find myself to check if I am a member of this workspace
    const member = await getMember({
      databases,
      workspaceId: memberToDelete.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (member.$id !== memberToDelete.$id && member.role !== MemberRole.ADMIN) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (allMembersInWorkspace.total === 1) {
      return c.json({ error: "Cannot delete the only member" }, 400);
    }

    // check is the member is creator of the workspace
    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      memberToDelete.workspaceId,
    );
    if (workspace.userId === memberId) {
      return c.json({ error: "Cannot delete the creator of workspace" }, 400);
    }

    // delete all tasks under this workspace that was assigned to this member
    const tasks = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
      Query.and([
        Query.equal("assigneeId", memberId),
        Query.equal("workspaceId", memberToDelete.workspaceId),
      ]),
    ]);
    if (tasks.total) {
      for (const task of tasks.documents) {
        await databases.deleteDocument(DATABASE_ID, TASKS_ID, task.$id);
      }
    }

    // delete all notification where to = memberId and workspaceId = this workspaceId
    const notifications = await databases.listDocuments(
      DATABASE_ID,
      NOTIFICATIONS_ID,
      [
        Query.and([
          Query.equal("workspaceId", memberToDelete.workspaceId),
          Query.equal("to", memberId),
        ]),
      ],
    );
    if (notifications.total) {
      for (const notification of notifications.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          NOTIFICATIONS_ID,
          notification.$id,
        );
      }
    }

    //   finally delete the member
    await databases.deleteDocument(DATABASE_ID, MEMBERS_ID, memberId);

    // notify this member
    await databases.createDocument(DATABASE_ID, NOTIFICATIONS_ID, ID.unique(), {
      workspaceId: workspace.$id,
      to: memberToDelete.userId,
      message: `Admin remove you from ${workspace.name} workspace.`,
    });

    return c.json({ data: { $id: memberToDelete.$id } });
  })
  .patch(
    ":memberId",
    sessionMiddleware,
    zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })),
    async (c) => {
      const { memberId } = c.req.param();
      const { role } = c.req.valid("json");
      const user = c.get("user");
      const databases = c.get("databases");

      //   check is the member is in database or not
      const memberToUpdate = await databases.getDocument<Member>(
        DATABASE_ID,
        MEMBERS_ID,
        memberId,
      );

      if (!memberToUpdate) {
        return c.json({ error: "User not found to delete" }, 400);
      }

      const allMembersInWorkspace = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("workspaceId", memberToUpdate.workspaceId)],
      );

      //   find myself to check if I am a member of this workspace
      const member = await getMember({
        databases,
        workspaceId: memberToUpdate.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized to access" }, 401);
      }

      if (member.role !== MemberRole.ADMIN) {
        return c.json({ error: "Unauthorized to update" }, 401);
      }

      if (allMembersInWorkspace.total === 1) {
        return c.json({ error: "Cannot downgrade the only member" }, 400);
      }

      // check is the member is creator of the workspace
      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        memberToUpdate.workspaceId,
      );
      if (workspace.userId === memberToUpdate.userId) {
        return c.json(
          { error: "Cannot downgrade the owner of workspace" },
          400,
        );
      }

      // finally update
      await databases.updateDocument(DATABASE_ID, MEMBERS_ID, memberId, {
        role,
      });

      return c.json({ data: { $id: memberToUpdate.$id } });
    },
  );

export default app;
