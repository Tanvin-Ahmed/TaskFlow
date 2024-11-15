import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  BulkUpdateTaskReqSchema,
  createTaskSchema,
  getTaskSchema,
} from "../schema";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite";
import { PopulatedTask, Task } from "../types";
import { Project } from "@/features/projects/types";
import { Member } from "@/features/members/types";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", getTaskSchema),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");
      const user = c.get("user");

      const { workspaceId, projectId, status, assigneeId, search, dueDate } =
        c.req.valid("query");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });
      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const query = [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt"),
      ];

      if (projectId) query.push(Query.equal("projectId", projectId));
      if (status) query.push(Query.equal("status", status));
      if (assigneeId) query.push(Query.equal("assigneeId", assigneeId));
      if (dueDate) query.push(Query.equal("dueDate", dueDate));
      if (search) query.push(Query.search("name", search));

      const tasks = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        query,
      );

      if (!tasks.total) {
        return c.json({ data: tasks });
      }

      // get ids to find projects and assignee information to tasks list
      const projectIds = tasks.documents.map((task) => task.projectId);
      const assigneeIds = tasks.documents.map((task) => task.assigneeId);

      // find all projects information
      const projects = await databases.listDocuments(
        DATABASE_ID,
        PROJECTS_ID,
        projectIds.length > 0 ? [Query.contains("$id", projectIds)] : [],
      );
      // find all assignee information
      const members = await databases.listDocuments<Member>(
        DATABASE_ID,
        MEMBERS_ID,
        assigneeIds.length > 0 ? [Query.contains("userId", assigneeIds)] : [],
      );

      const assignees = await Promise.all(
        members.documents.map(async (member) => {
          const user = await users.get(member.userId);

          return {
            ...member,
            name: user?.name || user?.email,
            email: user?.email,
          };
        }),
      );

      // populate project and assignee information with tasks information
      const populatedTasks = tasks.documents.map<PopulatedTask>((task) => {
        const project = projects.documents.find(
          (p) => p.$id === task.projectId,
        )!;
        const assignee = assignees.find((a) => a.userId === task.assigneeId)!;

        return {
          ...task,
          project: {
            name: project?.name,
            imageUrl: project?.imageUrl,
            $id: project.$id,
          },
          assignee: {
            name: assignee?.name,
            email: assignee?.email,
            $id: assignee.userId,
          },
        };
      });

      return c.json({ data: { ...tasks, documents: populatedTasks } });
    },
  )
  .get("/:taskId", sessionMiddleware, async (c) => {
    const { users } = await createAdminClient();
    const databases = c.get("databases");
    const user = c.get("user");
    const { taskId } = c.req.param();

    const task = await databases.getDocument<Task>(
      DATABASE_ID,
      TASKS_ID,
      taskId,
    );

    const currentUser = await getMember({
      databases,
      workspaceId: task.workspaceId,
      userId: user.$id,
    });
    if (!currentUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const project = await databases.getDocument<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      task.projectId,
    );

    const memberList = await databases.listDocuments<Member>(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal("userId", task.assigneeId)],
    );
    const member = memberList.documents[0];

    const userInfo = await users.get(member.userId);

    const assignee = {
      ...member,
      name: userInfo.name,
      email: userInfo.email,
    };

    return c.json({ data: { ...task, project, assignee } });
  })
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createTaskSchema),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const {
        name,
        status,
        workspaceId,
        projectId,
        dueDate,
        assigneeId,
        description,
      } = c.req.valid("json");

      // if not member of the workspace then not create any project
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });
      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const hightestPositionTask = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("status", status),
          Query.equal("workspaceId", workspaceId),
          Query.orderAsc("position"),
          Query.limit(1),
        ],
      );

      const newPosition =
        hightestPositionTask.documents.length > 0
          ? hightestPositionTask.documents[0].position + 1000
          : 1000;

      const task = await databases.createDocument(
        DATABASE_ID,
        TASKS_ID,
        ID.unique(),
        {
          name,
          status,
          workspaceId,
          projectId,
          dueDate,
          assigneeId,
          position: newPosition,
          description,
        },
      );

      return c.json({ data: task });
    },
  )
  .post(
    "/bulk-update",
    sessionMiddleware,
    zValidator("json", BulkUpdateTaskReqSchema),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { tasks } = c.req.valid("json");

      const tasksToUpdate = await databases.listDocuments<Task>(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.contains(
            "$id",
            tasks.map((t) => t.$id),
          ),
        ],
      );

      const workspaceIds = new Set(
        tasksToUpdate.documents.map((t) => t.workspaceId),
      );

      if (workspaceIds.size !== 1) {
        return c.json(
          { error: "All tasks must be belong to the same workspace" },
          409,
        );
      }

      const workspaceId = workspaceIds.values().next().value!;

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });
      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const updatedTasks = await Promise.all(
        tasks.map((task) => {
          const { $id, status, position } = task;

          return databases.updateDocument<Task>(DATABASE_ID, TASKS_ID, $id, {
            status,
            position,
          });
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
      const databases = c.get("databases");
      const { name, status, projectId, dueDate, assigneeId, description } =
        c.req.valid("json");

      const { taskId } = c.req.param();

      const existingTask = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId,
      );

      // if not member of the workspace then not create any project
      const member = await getMember({
        databases,
        workspaceId: existingTask.workspaceId,
        userId: user.$id,
      });
      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const task = await databases.updateDocument(
        DATABASE_ID,
        TASKS_ID,
        taskId,
        {
          name,
          status,
          projectId,
          dueDate,
          assigneeId,
          description,
        },
      );

      return c.json({ data: task });
    },
  )
  .delete("/:taskId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { taskId } = c.req.param();

    const task = await databases.getDocument<Task>(
      DATABASE_ID,
      TASKS_ID,
      taskId,
    );

    const member = await getMember({
      databases,
      workspaceId: task.workspaceId,
      userId: user.$id,
    });
    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await databases.deleteDocument(DATABASE_ID, TASKS_ID, taskId);

    return c.json({ data: { $id: task.$id } });
  });

export default app;
