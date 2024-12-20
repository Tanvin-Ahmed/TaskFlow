import {
  DATABASE_ID,
  IMAGES_BUCKET_ID,
  NOTIFICATIONS_ID,
  PROJECTS_ID,
  TASKS_ID,
} from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { createProjectSchema, updateProjectSchema } from "../schema";
import { Project } from "../types";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { Task, TaskStatus } from "@/features/tasks/types";
import { createAdminClient } from "@/lib/appwrite";
import { getIsOwner } from "@/features/auth/server/queries";
import { getAssignees } from "./action";
import { liveblocks } from "@/features/live-block/server/route";

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
      const databases = c.get("databases");

      const { workspaceId, limit } = c.req.valid("query");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const queries = [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt"),
      ];

      if (limit) queries.push(Query.limit(Number(limit)));

      const projects = await databases.listDocuments<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        queries,
      );

      return c.json({ data: projects });
    },
  )
  .get("/:projectId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { projectId } = c.req.param();

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      projectId,
    );

    const member = await getMember({
      databases,
      workspaceId: project.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    return c.json({ data: project });
  })
  .get("/:projectId/analytics", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { projectId } = c.req.param();

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      projectId,
    );

    const member = await getMember({
      databases,
      workspaceId: project.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // analytics logics
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ],
    );

    const lastMonthTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ],
    );

    const taskCount = thisMonthTasks.total;
    const taskDifference = taskCount - lastMonthTasks.total;

    const thisMonthAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.equal("assigneeId", member.$id),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ],
    );

    const lastMonthAssignedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.equal("assigneeId", member.$id),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ],
    );

    const assignedTaskCount = thisMonthAssignedTasks.total;
    const assignedTaskDifference =
      assignedTaskCount - lastMonthAssignedTasks.total;

    const thisMonthIncompleteTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ],
    );

    const lastMonthIncompleteTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ],
    );

    const incompleteTaskCount = thisMonthIncompleteTasks.total;
    const incompleteTaskDifference =
      incompleteTaskCount - lastMonthIncompleteTasks.total;

    const thisMonthCompletedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.equal("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ],
    );

    const lastMonthCompletedTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.equal("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ],
    );

    const completedTaskCount = thisMonthCompletedTasks.total;
    const completedTaskDifference =
      completedTaskCount - lastMonthCompletedTasks.total;

    const thisMonthOverdueTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.lessThan("dueDate", now.toISOString()),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ],
    );

    const lastMonthOverdueTasks = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("projectId", projectId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.lessThan("dueDate", now.toISOString()),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ],
    );

    const overdueTaskCount = thisMonthOverdueTasks.total;
    const overdueTaskDifference =
      overdueTaskCount - lastMonthOverdueTasks.total;

    return c.json({
      data: {
        taskCount,
        taskDifference,
        assignedTaskCount,
        assignedTaskDifference,
        completedTaskCount,
        completedTaskDifference,
        incompleteTaskCount,
        incompleteTaskDifference,
        overdueTaskCount,
        overdueTaskDifference,
      },
    });
  })
  .get("/:projectId/assignees", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { projectId } = c.req.param();
    const { users } = await createAdminClient();

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      projectId,
    );

    const member = await getMember({
      databases,
      workspaceId: project.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // add main logic to get detail information of assignees
    const tasks = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID, [
      Query.equal("projectId", projectId),
    ]);
    const assigneeIds = Array.from(
      new Set(tasks.documents.map((doc) => doc.assigneeId)),
    );

    const userDetails = await users.list([Query.contains("$id", assigneeIds)]);

    const userDetailsWithoutSensitiveInfo = userDetails.total
      ? userDetails.users.map(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ password, hash, passwordUpdate, hashOptions, ...rest }) => rest,
        )
      : [];

    return c.json({ data: userDetailsWithoutSensitiveInfo });
  })
  .post(
    "/",
    sessionMiddleware,
    zValidator("form", createProjectSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { name, image, workspaceId } = c.req.valid("form");

      // if the user is not the member of the workspace then he/she is not allowed to create a new project under this workspace
      const workspaceMember = await getMember({
        databases,
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

      const isOwner = getIsOwner(user.$id, workspaceId);
      if (!isOwner) {
        return c.json(
          {
            error: "Unauthorized. Only workspace owner can create new project.",
          },
          401,
        );
      }

      let uploadedImageUrl: string | undefined;
      let imageId: string | undefined;

      if (image instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image,
        );

        imageId = file.$id;

        const arrayBuffer = await storage.getFilePreview(
          IMAGES_BUCKET_ID,
          file.$id,
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
      }

      const project = await databases.createDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        ID.unique(),
        {
          name,
          workspaceId,
          imageUrl: uploadedImageUrl,
          userId: user.$id,
          imageId,
        },
      );

      return c.json({ data: project });
    },
  )
  .patch(
    "/:projectId",
    zValidator("form", updateProjectSchema),
    sessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { projectId } = c.req.param();
      const {
        name,
        image,
        docs,
        canvas,
        isDocCreated,
        docPermissionMemberList,
      } = c.req.valid("form");

      const existingProject = await databases.getDocument<Project>(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
      );

      const member = await getMember({
        databases,
        workspaceId: existingProject.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const isOwner = getIsOwner(user.$id, existingProject.workspaceId);
      if (!isOwner) {
        return c.json(
          {
            error: "Unauthorized. Only workspace owner can create new project.",
          },
          401,
        );
      }

      let uploadedImageUrl: string | undefined;
      let imageId: string | undefined;

      if (image instanceof File) {
        // delete existing image from bucket
        if (existingProject.imageId) {
          await storage.deleteFile(IMAGES_BUCKET_ID, existingProject.imageId);
        }

        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image,
        );

        imageId = file.$id;

        const arrayBuffer = await storage.getFilePreview(
          IMAGES_BUCKET_ID,
          file.$id,
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
      } else {
        uploadedImageUrl = image;
      }

      const project = await databases.updateDocument(
        DATABASE_ID,
        PROJECTS_ID,
        projectId,
        {
          name,
          imageUrl: uploadedImageUrl,
          imageId: imageId ?? existingProject?.imageId,
          docs,
          canvas,
          isDocCreated: isDocCreated ? Boolean(isDocCreated) : undefined,
          docPermissionMemberList,
        },
      );

      return c.json({ data: project });
    },
  )
  .delete("/:projectId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const storage = c.get("storage");

    const { projectId } = c.req.param();

    const existingProject = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      projectId,
    );

    const member = await getMember({
      databases,
      workspaceId: existingProject.workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // check is owner
    const isOwner = getIsOwner(user.$id, existingProject.workspaceId);

    if (!isOwner) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const assignees = await getAssignees(projectId);

    // handle delete doc if created
    if (Boolean(existingProject.isDocCreated)) {
      await liveblocks.deleteRoom(projectId);
    }

    // delete all tasks of the project
    const tasks = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID, [
      Query.equal("projectId", projectId),
    ]);
    if (tasks.total) {
      const deletePromises = tasks.documents.map((tasks) =>
        databases.deleteDocument(DATABASE_ID, TASKS_ID, tasks.$id),
      );

      await Promise.all(deletePromises);
    }

    // delete all notifications related to this project
    const allNotificationsOfProject = await databases.listDocuments(
      DATABASE_ID,
      NOTIFICATIONS_ID,
      [Query.equal("projectId", projectId)],
    );

    if (allNotificationsOfProject.total) {
      await Promise.all(
        allNotificationsOfProject.documents.map((notification) =>
          databases.deleteDocument(
            DATABASE_ID,
            NOTIFICATIONS_ID,
            notification.$id,
          ),
        ),
      );
    }

    // finally delete the project
    if (existingProject?.imageId) {
      await storage.deleteFile(IMAGES_BUCKET_ID, existingProject.imageId);
    }
    await databases.deleteDocument(DATABASE_ID, PROJECTS_ID, projectId);

    // notify all assignees of this project
    const queries = [Query.equal("projectId", projectId)];
    if (assignees.length > 0) {
      const assigneesId = assignees.map((assignee) => assignee.$id);
      queries.push(Query.contains("to", assigneesId));

      await Promise.all(
        assigneesId.map((assigneeId) =>
          databases.createDocument(DATABASE_ID, NOTIFICATIONS_ID, ID.unique(), {
            workspaceId: existingProject.workspaceId,
            to: assigneeId,
            message: `${existingProject.name} is deleted by ${user.name}.`,
          }),
        ),
      );
    }

    return c.json(
      { data: { $id: projectId, workspaceId: existingProject.workspaceId } },
      200,
    );
  });

export default app;
