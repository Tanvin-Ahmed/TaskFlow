import { sessionMiddleware } from "@/lib/session-middleware";
import { Hono } from "hono";
import { and, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import {
  members,
  notifications,
  projects,
  tasks,
  workspaces,
} from "@/db/schema";
import { toDocument } from "@/db/mappers";
import { PopulatedNotification } from "../type";

const getWorkspaceRequiredInfo = (workspace?: {
  id: string;
  name: string;
  imageUrl: string | null;
}) => {
  return {
    $id: workspace?.id || "",
    name: workspace?.name || "",
    imageUrl: workspace?.imageUrl ?? undefined,
  };
};

const getProjectRequiredInfo = (project?: {
  id: string;
  name: string;
  imageUrl: string | null;
}) => {
  return {
    $id: project?.id || "",
    name: project?.name || "",
    imageUrl: project?.imageUrl ?? undefined,
  };
};

const app = new Hono().get("/", sessionMiddleware, async (c) => {
  const user = c.get("user");

  const memberOfWorkspace = await db
    .select()
    .from(members)
    .where(eq(members.userId, user.$id));

  const workspaceIds = memberOfWorkspace.map((m) => m.workspaceId);

  const workspaceRows = workspaceIds.length
    ? await db
        .select()
        .from(workspaces)
        .where(inArray(workspaces.id, workspaceIds))
    : [];

  const assignedTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.assigneeId, user.$id));

  const uniqueProjectIds = Array.from(
    new Set(assignedTasks.map((doc) => doc.projectId)),
  );

  const projectRows = uniqueProjectIds.length
    ? await db
        .select()
        .from(projects)
        .where(inArray(projects.id, uniqueProjectIds))
    : [];

  const orConditions = [eq(notifications.to, user.$id)];

  if (uniqueProjectIds.length) {
    orConditions.push(
      and(
        isNull(notifications.to),
        inArray(notifications.projectId, uniqueProjectIds),
      )!,
    );
  }

  if (workspaceIds.length) {
    orConditions.push(
      and(
        isNull(notifications.to),
        isNull(notifications.projectId),
        inArray(notifications.workspaceId, workspaceIds),
      )!,
    );
  }

  const notificationRows = await db
    .select()
    .from(notifications)
    .where(or(...orConditions))
    .orderBy(desc(notifications.createdAt));

  if (!notificationRows.length) {
    return c.json({
      data: {
        unseenNotificationCount: 0,
        totalNotificationCount: 0,
        notifications: [],
      },
    });
  }

  const populatedNotifications = notificationRows.map((notification) => {
    const workspaceInfo = workspaceRows.find(
      (workspace) => workspace.id === notification.workspaceId,
    );
    const requiredWorkspaceInfo = getWorkspaceRequiredInfo(workspaceInfo);

    let requiredProjectInfo: {
      $id: string;
      name: string;
      imageUrl?: string | null;
    } | null = null;

    if (notification.projectId) {
      const projectInfo = projectRows.find(
        (project) => project.id === notification.projectId,
      );
      if (projectInfo) {
        requiredProjectInfo = getProjectRequiredInfo(projectInfo);
      }
    }

    const seenBy = Array.isArray(notification.seenBy)
      ? notification.seenBy
      : [];

    return {
      ...toDocument(notification),
      message: notification.message,
      taskId: notification.taskId,
      to: notification.to,
      link: notification.link,
      isMeetingNotification: notification.isMeetingNotification,
      seenBy,
      workspace: requiredWorkspaceInfo,
      project: requiredProjectInfo,
    };
  });

  return c.json({
    data: {
      unseenNotificationCount: populatedNotifications.filter(
        (notify) => !notify?.seenBy?.includes(user.$id),
      ).length,
      totalNotificationCount: populatedNotifications.length,
      notifications: populatedNotifications as PopulatedNotification[],
    },
  });
});

export default app;
