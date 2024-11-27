"use server";

import { DATABASE_ID, NOTIFICATIONS_ID } from "@/config";
import { createSessionClient } from "@/lib/appwrite";
import { Query } from "node-appwrite";
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
    notifications.documents.map((notification) =>
      databases.updateDocument(
        DATABASE_ID,
        NOTIFICATIONS_ID,
        notification.$id,
        {
          seenBy: notification.seenBy
            ? JSON.stringify(
                (JSON.parse(notification.seenBy) as string[]).push(user.$id),
              )
            : JSON.stringify([user.$id]),
        },
      ),
    ),
  );

  return { success: true };
};
