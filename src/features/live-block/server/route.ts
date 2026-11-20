import { Hono } from "hono";
import { Liveblocks } from "@liveblocks/node";
import { sessionMiddleware } from "@/lib/session-middleware";
import { getAccessType, getUserColor } from "@/lib/utils";
import { StatusCode } from "hono/utils/http-status";
import { getMember } from "@/features/members/utils";
import { and, eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { updateDocAccessSchema } from "../schema";
import { AccessType, UserType } from "../types";
import {
  getIsAdmin,
  getIsOwner,
  getUsers,
} from "@/features/auth/server/queries";
import { db } from "@/db";
import { projects, tasks } from "@/db/schema";

export const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

const app = new Hono()
  .post("/", sessionMiddleware, async (c) => {
    const authUser = c.get("user");

    const user = {
      id: authUser.$id,
      info: {
        id: authUser.$id,
        email: authUser.email,
        name: authUser?.name,
        color: getUserColor(authUser.$id),
      },
    };

    const { status, body } = await liveblocks.identifyUser(
      {
        userId: user.info.email,
        groupIds: [],
      },
      { userInfo: user.info },
    );

    return c.text(body, status as StatusCode);
  })
  .get("/:roomId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { roomId } = c.req.param();

    const room = await liveblocks.getRoom(roomId);

    if (!Object.keys(room.usersAccesses).includes(user.email)) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userIds = Object.keys(room.usersAccesses);
    const usersInfo = await getUsers(userIds);

    const usersData = usersInfo
      .map((roomUser) => {
        if (!roomUser) return null;

        const permission = room.usersAccesses[roomUser.email];

        return {
          ...roomUser,
          userType: (roomUser && permission[0] === "room:write"
            ? "editor"
            : "viewer") as UserType,
        };
      })
      .filter(Boolean);

    const currentUserType: UserType =
      room.usersAccesses[user.email][0] === "room:write" ? "editor" : "viewer";

    return c.json({
      data: { room, collaborators: usersData, currentUserType },
    });
  })
  .patch(
    "/accessModify/:roomId",
    sessionMiddleware,
    zValidator("json", updateDocAccessSchema),
    async (c) => {
      const user = c.get("user");
      const { roomId } = c.req.param();
      const { emails, userType, updatedBy } = c.req.valid("json");

      const [existingProject] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, roomId))
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

      const projectTask = await db
        .select()
        .from(tasks)
        .where(
          and(eq(tasks.projectId, roomId), eq(tasks.assigneeId, user.$id)),
        );

      const isAssignee = projectTask.length > 0;
      const isOwner = await getIsOwner(user.$id, existingProject.workspaceId);
      const isAdmin = await getIsAdmin(
        existingProject.workspaceId,
        user.$id,
      ).catch(() => false);

      if (!isOwner && (!isAssignee || (isAssignee && !isAdmin))) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const room = await liveblocks.getRoom(roomId);
      const type = getAccessType(userType) as AccessType;
      const usersAccesses: Record<string, AccessType> = {
        ...room.usersAccesses,
      };
      emails.forEach((email) => {
        usersAccesses[email] = type;
      });

      const updatedRoom = await liveblocks.updateRoom(roomId, {
        usersAccesses,
      });

      if (updatedRoom) {
        emails.forEach(async (email) => {
          const notificationId = crypto.randomUUID();

          await liveblocks.triggerInboxNotification({
            userId: email,
            kind: "$documentAccess",
            subjectId: notificationId,
            roomId,
            activityData: {
              userType,
              title: `You have been granted ${userType} access to the ${existingProject.name}'s documentation.`,
              updatedBy: updatedBy.name,
              email: updatedBy.email,
            },
          });
        });
      }

      const permittedEmails = Object.keys(usersAccesses);
      await db
        .update(projects)
        .set({
          docPermissionMemberList: permittedEmails,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, roomId));

      return c.json({ data: room });
    },
  )
  .delete("/:roomId/:collaboratorId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { roomId, collaboratorId } = c.req.param();

    const [existingProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, roomId))
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

    const projectTask = await db
      .select()
      .from(tasks)
      .where(
        and(eq(tasks.projectId, roomId), eq(tasks.assigneeId, user.$id)),
      );
    const isAssignee = projectTask.length > 0;
    const isOwner = await getIsOwner(user.$id, existingProject.workspaceId);
    const isAdmin = await getIsAdmin(
      existingProject.workspaceId,
      user.$id,
    ).catch(() => false);

    if (!isOwner || !isAssignee || (isAssignee && !isAdmin)) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const room = await liveblocks.getRoom(roomId);

    if (room.metadata.email === collaboratorId) {
      throw new Error("You cannot remove yourself from the document");
    }

    const updateRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [collaboratorId]: null,
      },
    });

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, roomId))
      .limit(1);

    if (project?.docPermissionMemberList) {
      const permittedUsers = project.docPermissionMemberList;
      await db
        .update(projects)
        .set({
          docPermissionMemberList: permittedUsers.filter(
            (email) => email !== collaboratorId,
          ),
          updatedAt: new Date(),
        })
        .where(eq(projects.id, roomId));
    }

    return c.json({ data: updateRoom });
  })
  .delete("/delete-room/:roomId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { roomId } = c.req.param();

    const [existingProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, roomId))
      .limit(1);

    if (!existingProject) {
      return c.json({ error: "Project not found" }, 404);
    }

    const isOwner = await getIsOwner(user.$id, existingProject.workspaceId);
    if (!isOwner) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await liveblocks.deleteRoom(roomId);

    await db
      .update(projects)
      .set({
        docPermissionMemberList: null,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, roomId));

    return c.json({ data: { success: true, roomId } });
  });

export default app;
