import { DATABASE_ID, USER_PAYMENT_STATUS_ID } from "@/config";
import { createSessionClient } from "./../../../lib/appwrite";
import { ID, Query } from "node-appwrite";
import { PaymentStatus } from "@/features/pricing/types";

export const getCurrent = async () => {
  try {
    const { account } = await createSessionClient();

    return await account.get();
  } catch {
    return null;
  }
};

export const createUserPaymentStatusInBD = async () => {
  const user = await getCurrent();

  if (!user) return;

  const { databases } = await createSessionClient();

  const existing = await databases.listDocuments(
    DATABASE_ID,
    USER_PAYMENT_STATUS_ID,
    [Query.equal("userId", user.$id)],
  );

  if (existing.total) {
    return;
  }

  await databases.createDocument(
    DATABASE_ID,
    USER_PAYMENT_STATUS_ID,
    ID.unique(),
    {
      userId: user.$id,
      paymentStatus: PaymentStatus.Normal,
    },
  );
};
