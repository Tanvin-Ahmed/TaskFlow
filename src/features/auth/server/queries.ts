"use server";

import {
  DATABASE_ID,
  MEMBERS_ID,
  TASKS_ID,
  USER_PAYMENT_STATUS_ID,
  WORKSPACES_ID,
} from "@/config";
import {
  createAdminClient,
  createSessionClient,
} from "./../../../lib/appwrite";
import { ID, Permission, Query, Role } from "node-appwrite";
import { PaymentStatus } from "@/features/pricing/types";
import { getUserColor } from "@/lib/utils";
import { Member, MemberRole } from "@/features/members/types";
import { Workspace } from "@/features/workspaces/types";
import { getMember } from "@/features/members/utils";
import { Task } from "@/features/tasks/types";

export const getCurrent = async () => {
  try {
    const { account } = await createSessionClient();

    return await account.get();
  } catch {
    return null;
  }
};

export const getUsers = async (userIds: string[]) => {
  const { users } = await createAdminClient();

  const usersInfo = await users.list([Query.contains("email", userIds)]);

  const requiredInfo = usersInfo.users.map((user) => ({
    id: user.$id,
    name: user.name,
    email: user.email,
    color: getUserColor(user.$id),
  }));

  const sortedUsers = userIds.map((email) =>
    requiredInfo.find((user) => user.email === email),
  );

  return sortedUsers;
};

export const getUserDetailsByIds = async (userIds: string[]) => {
  const { users } = await createAdminClient();
  const userDetails = await users.list([Query.contains("$id", userIds)]);

  return userDetails;
};

export const getWorkspaceUsers = async (workspaceId: string) => {
  const { databases } = await createSessionClient();
  const members = await databases.listDocuments<Member>(
    DATABASE_ID,
    MEMBERS_ID,
    [Query.equal("workspaceId", workspaceId)],
  );

  const memberIds = members.documents.map((member) => member.userId);
  const membersInfo = await getUserDetailsByIds(memberIds);

  return membersInfo;
};

export const getProjectAssignees = async (
  projectId: string,
  workspaceId: string,
) => {
  const { databases } = await createSessionClient();

  const user = await getCurrent();
  if (!user) throw new Error("Unauthorized to access");

  const member = await getMember({ databases, workspaceId, userId: user.$id });
  if (!member) throw new Error("Unauthorized to access");

  const tasks = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID, [
    Query.equal("projectId", projectId),
  ]);

  const assigneeIds = Array.from(
    new Set(tasks.documents.map((doc) => doc.assigneeId)),
  );

  return assigneeIds;
};

export const getIsOwner = async (
  userId: string,
  workspaceId: string,
): Promise<boolean> => {
  const { databases } = await createSessionClient();

  const workspace = await databases.getDocument<Workspace>(
    DATABASE_ID,
    WORKSPACES_ID,
    workspaceId,
  );

  return workspace.userId === userId;
};

export const getIsAdmin = async (workspaceId: string, userId: string) => {
  const { databases } = await createSessionClient();

  const member = await getMember({
    databases,
    workspaceId,
    userId,
  });

  if (!member) {
    throw new Error("Unauthorized access");
  }

  return member.role === MemberRole.ADMIN;
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
    [
      Permission.read(Role.any()),
      Permission.update(Role.any()),
      Permission.update(Role.any()),
      Permission.delete(Role.any()),
      Permission.delete(Role.any()),
    ],
  );
};
