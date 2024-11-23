import {
  DATABASE_ID,
  MEMBERS_ID,
  NOTIFICATIONS_ID,
  PROJECTS_ID,
  TASKS_ID,
  WORKSPACES_ID,
} from "@/config";
import { Member } from "@/features/members/types";
import { Project } from "@/features/projects/types";
import { Task } from "@/features/tasks/types";
import { Workspace } from "@/features/workspaces/types";
import { sessionMiddleware } from "@/lib/session-middleware";
import { Hono } from "hono";
import { Query } from "node-appwrite";
import { Notification, PopulatedNotification } from "../type";

const getWorkspaceRequiredInfo = (workspace: Workspace) => {
  return {
    $id: workspace?.$id,
    name: workspace?.name,
    imageUrl: workspace?.imageUrl,
  };
};
const getProjectRequiredInfo = (project: Project) => {
  return {
    $id: project?.$id,
    name: project?.name,
    imageUrl: project?.imageUrl,
  };
};

const app = new Hono().get("/", sessionMiddleware, async (c) => {
  const databases = c.get("databases");
  const user = c.get("user");

  // ******** GET ALL WORKSPACES AND PROJECTS THAT ARE ATTACHED WITH THIS USER ******** //
  // get all workspaces information where the current user added
  const memberOfWorkspace = await databases.listDocuments<Member>(
    DATABASE_ID,
    MEMBERS_ID,
    [Query.equal("userId", user.$id)],
  );
  const workspaceIds = memberOfWorkspace.documents.map((m) => m.workspaceId);

  let workspaces;
  if (workspaceIds.length) {
    workspaces = await databases.listDocuments<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      [Query.contains("$id", workspaceIds)],
    );
  }

  // get all projects information where the current user added
  const tasks = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID, [
    Query.equal("assigneeId", user.$id),
  ]);
  const uniqueProjectIds = Array.from(
    new Set(tasks.documents.map((doc) => doc.projectId)),
  );

  let projects;
  if (uniqueProjectIds.length) {
    projects = await databases.listDocuments<Project>(
      DATABASE_ID,
      PROJECTS_ID,
      [Query.contains("$id", uniqueProjectIds)],
    );
  }

  const userAttachedWith = {
    workspaces: workspaces?.documents ?? [],
    workspaceIds,
    projects: projects?.documents ?? [],
    projectIds: uniqueProjectIds,
  };

  // **** MAIN LOGIC TO FIND NOTIFICATIONS **** //
  // write required queries to get unseen notifications
  const orQueries = [Query.equal("to", user.$id)];
  if (userAttachedWith.projectIds.length) {
    orQueries.push(Query.contains("projectId", userAttachedWith.projectIds));
  }
  if (userAttachedWith.workspaceIds.length) {
    orQueries.push(
      Query.contains("workspaceId", userAttachedWith.workspaceIds),
    );
  }

  const QueriesForUnseenNotification = [Query.isNull("readAt")];
  if (orQueries.length > 1) {
    QueriesForUnseenNotification.push(Query.or(orQueries));
  } else {
    QueriesForUnseenNotification.push(...orQueries);
  }

  const QueriesForSeenNotification = [Query.isNotNull("readAt")];
  if (orQueries.length > 1) {
    QueriesForSeenNotification.push(Query.or(orQueries));
  } else {
    QueriesForSeenNotification.push(...orQueries);
  }

  // get notifications
  const unseenNotifications = await databases.listDocuments<Notification>(
    DATABASE_ID,
    NOTIFICATIONS_ID,
    QueriesForUnseenNotification,
  );
  const seenNotifications = await databases.listDocuments<Notification>(
    DATABASE_ID,
    NOTIFICATIONS_ID,
    QueriesForSeenNotification,
  );

  // if no notifications are available
  if (!unseenNotifications.total && !seenNotifications.total) {
    return c.json({
      data: {
        unseenNotificationCount: 0,
        totalNotificationCount: 0,
        notifications: [],
      },
    });
  }

  // populate workspace and project data in notifications
  const populatedNotifications = [
    ...unseenNotifications.documents,
    ...seenNotifications.documents,
  ].map((notification) => {
    const { workspaceId, projectId, ...rest } = notification;

    const workspaceInfo = userAttachedWith.workspaces.find(
      (workspace) => workspace.$id === workspaceId,
    );
    const requiredWorkspaceInfo = getWorkspaceRequiredInfo(workspaceInfo!);

    let requiredProjectInfo: { $id: string; name: string } | null = null;
    if (projectId) {
      const projectInfo = userAttachedWith.projects.find(
        (project) => project.$id === projectId,
      );

      if (projectInfo)
        requiredProjectInfo = getProjectRequiredInfo(projectInfo);
    }

    const populatedNotification = {
      ...rest,
      workspace: requiredWorkspaceInfo,
      project: requiredProjectInfo,
    };

    return populatedNotification;
  });

  return c.json({
    data: {
      unseenNotificationCount: unseenNotifications.total,
      totalNotificationCount: populatedNotifications.length,
      notifications: populatedNotifications as PopulatedNotification[],
    },
  });
});

export default app;
