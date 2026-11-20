"use server";

import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { createId } from "@/lib/id";
import { getCurrent } from "@/features/auth/server/queries";

export const makeUnseenNotificationAsSeen = async (
  notificationIds: string[],
) => {
  const user = await getCurrent();
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!notificationIds.length) {
    return { success: true };
  }

  const rows = await db
    .select()
    .from(notifications)
    .where(inArray(notifications.id, notificationIds));

  await Promise.all(
    rows.map(async (notification) => {
      const seenBy = Array.isArray(notification.seenBy)
        ? [...notification.seenBy]
        : [];

      if (!seenBy.includes(user.$id)) {
        seenBy.push(user.$id);
        await db
          .update(notifications)
          .set({
            seenBy,
            updatedAt: new Date(),
          })
          .where(eq(notifications.id, notification.id));
      }
    }),
  );

  return { success: true };
};

interface PushNotificationParams {
  workspaceId: string;
  message: string;
  projectId?: string;
  taskId?: string;
  to?: string;
  link?: string;
  isMeetingNotification: boolean;
}

export const pushNotification = async (params: PushNotificationParams) => {
  const user = await getCurrent();
  if (!user) return false;

  await db.insert(notifications).values({
    id: createId(),
    ...params,
  });

  return true;
};
