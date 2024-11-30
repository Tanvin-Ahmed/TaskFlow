"use server";

import { DATABASE_ID, NOTIFICATIONS_ID } from "@/config";
import { createSessionClient } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";
import { Notification } from "../type";

export const makeUnseenNotificationAsSeen = async (
  notificationsId: string[],
) => {
  const { databases, account } = await createSessionClient();
  const user = await account.get();

  const notifications = await databases.listDocuments<Notification>(
    DATABASE_ID,
    NOTIFICATIONS_ID,
    [Query.contains("$id", notificationsId)],
  );

  await Promise.all(
    notifications.documents.map((notification) => {
      let sendBy = [];
      if (notification.seenBy) {
        sendBy = JSON.parse(notification.seenBy) as string[];
        sendBy.push(user.$id);
      } else {
        sendBy.push(user.$id);
      }

      return databases.updateDocument(
        DATABASE_ID,
        NOTIFICATIONS_ID,
        notification.$id,
        {
          seenBy: JSON.stringify(sendBy),
        },
      );
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
  const { databases, account } = await createSessionClient();
  const user = await account.get();

  if (!user) return false;

  await databases.createDocument(DATABASE_ID, NOTIFICATIONS_ID, ID.unique(), {
    ...params,
  });

  return true;
};
