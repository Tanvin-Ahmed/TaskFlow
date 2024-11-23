"use server";

import { DATABASE_ID, NOTIFICATIONS_ID } from "@/config";
import { createSessionClient } from "@/lib/appwrite";

export const makeUnseenNotificationAsSeen = async (
  notificationsId: string[],
) => {
  const { databases } = await createSessionClient();

  await Promise.all(
    notificationsId.map((id) =>
      databases.updateDocument(DATABASE_ID, NOTIFICATIONS_ID, id, {
        readAt: new Date().toISOString(),
      }),
    ),
  );

  return { success: true };
};
