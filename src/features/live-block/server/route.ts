import { Hono } from "hono";
import { Liveblocks } from "@liveblocks/node";
import { sessionMiddleware } from "@/lib/session-middleware";
import { getAccessType, getUserColor } from "@/lib/utils";
import { StatusCode } from "hono/utils/http-status";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { Project } from "@/features/projects/types";
import {
  getIsAdmin,
  getIsOwner,
  getUsers,
} from "@/features/auth/server/queries";
import { Task } from "@/features/tasks/types";
import { Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import { updateDocAccessSchema } from "../schema";
import { AccessType, UserType } from "../types";

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
      .map((user) => {
        if (!user) return null;

        const permission = room.usersAccesses[user.email];

        return {
          ...user,
          userType: (user && permission[0] === "room:write"
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
      const databases = c.get("databases");
      const user = c.get("user");

      const { roomId } = c.req.param();
      const { emails, userType } = c.req.valid("json");

      const existingProject = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        roomId,
      );

      const member = await getMember({
        databases,
        workspaceId: existingProject.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // check is the user is owner or admin (if any assignee is admin)
      const projectTask = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        [Query.equal("projectId", roomId), Query.equal("assigneeId", user.$id)],
      );
      const isAssignee = !!projectTask.total;
      const isOwner = await getIsOwner(user.$id, existingProject.workspaceId);
      const isAdmin = await getIsAdmin(existingProject.workspaceId, user.$id);

      if (!isOwner && (!isAssignee || (isAssignee && !isAdmin))) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // get room access information
      const room = await liveblocks.getRoom(roomId);

      // give the permission
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
        // TODO: send a notification to the user
      }

      // save in db
      const permittedEmails = Object.keys(usersAccesses);
      await databases.updateDocument(DATABASE_ID, PROJECTS_ID, roomId, {
        docPermissionMemberList: JSON.stringify(permittedEmails),
      });

      return c.json({ data: room });
    },
  )
  .delete("/:roomId/:collaboratorId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { roomId, collaboratorId } = c.req.param();

    // check is this user is in workspace
    const existingProject = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      roomId,
    );

    const member = await getMember({
      databases,
      workspaceId: existingProject.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // check is the user is owner or admin (if any assignee is admin)
    const projectTask = await databases.listDocuments<Task>(
      DATABASE_ID,
      TASKS_ID,
      [Query.equal("projectId", roomId), Query.equal("assigneeId", user.$id)],
    );
    const isAssignee = !!projectTask.total;
    const isOwner = await getIsOwner(user.$id, existingProject.workspaceId);
    const isAdmin = await getIsAdmin(existingProject.workspaceId, user.$id);

    if (!isOwner || !isAssignee || (isAssignee && !isAdmin)) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // remove member
    const room = await liveblocks.getRoom(roomId);

    if (room.metadata.email === collaboratorId) {
      throw new Error("You cannot remove yourself from the document");
    }

    const updateRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [collaboratorId]: null,
      },
    });

    // save it in db
    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      roomId,
    );

    if (project.docPermissionMemberList) {
      const permittedUsers = JSON.parse(
        project.docPermissionMemberList,
      ) as string[];

      await databases.updateDocument(DATABASE_ID, PROJECTS_ID, roomId, {
        docPermissionMemberList: JSON.stringify(
          permittedUsers.filter((email) => email !== collaboratorId),
        ),
      });
    }

    return c.json({ data: updateRoom });
  })
  .delete("/delete-room/:roomId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { roomId } = c.req.param();

    // check is the user is owner or not
    const existingProject = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      roomId,
    );
    const isOwner = await getIsOwner(user.$id, existingProject.workspaceId);

    if (!isOwner) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await liveblocks.deleteRoom(roomId);

    // save it in db
    await databases.updateDocument(DATABASE_ID, PROJECTS_ID, roomId, {
      docPermissionMemberList: undefined,
    });

    return c.json({ data: { success: true, roomId } });
  });

export default app;
