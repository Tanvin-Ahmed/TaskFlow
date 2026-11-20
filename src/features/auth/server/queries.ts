"use server";

import { currentUser } from "@clerk/nextjs/server";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  members,
  tasks,
  userPaymentStatus,
  workspaces,
} from "@/db/schema";
import { createId } from "@/lib/id";
import {
  getClerkUsersByEmails,
  getClerkUsersByIds,
} from "@/lib/clerk-user";
import type { AppUser } from "@/types/auth";
import { MemberRole } from "@/features/members/types";
import { PaymentStatus } from "@/features/pricing/types";
import { getMember } from "@/features/members/utils";

export const getCurrent = async (): Promise<AppUser | null> => {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email =
      clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      "";

    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      email;

    return {
      $id: clerkUser.id,
      name,
      email,
      imageUrl: clerkUser.imageUrl,
    };
  } catch {
    return null;
  }
};

export const getUsers = async (userIdsOrEmails: string[]) => {
  const looksLikeEmail = userIdsOrEmails.some((v) => v.includes("@"));
  if (looksLikeEmail) {
    return getClerkUsersByEmails(userIdsOrEmails);
  }
  const users = await getClerkUsersByIds(userIdsOrEmails);
  return userIdsOrEmails.map((id) => users.find((u) => u.id === id));
};

export const getUserDetailsByIds = async (userIds: string[]) => {
  const users = await getClerkUsersByIds(userIds);
  return {
    total: users.length,
    users: users.map((u) => ({
      $id: u.$id,
      name: u.name,
      email: u.email,
    })),
  };
};

export const getWorkspaceUsers = async (workspaceId: string) => {
  const memberRows = await db
    .select()
    .from(members)
    .where(eq(members.workspaceId, workspaceId));

  const memberIds = memberRows.map((member) => member.userId);
  return getUserDetailsByIds(memberIds);
};

export const getProjectAssignees = async (
  projectId: string,
  workspaceId: string,
) => {
  const user = await getCurrent();
  if (!user) throw new Error("Unauthorized to access");

  const member = await getMember({ workspaceId, userId: user.$id });
  if (!member) throw new Error("Unauthorized to access");

  const taskRows = await db
    .select({ assigneeId: tasks.assigneeId })
    .from(tasks)
    .where(eq(tasks.projectId, projectId));

  return Array.from(new Set(taskRows.map((doc) => doc.assigneeId)));
};

export const getIsOwner = async (
  userId: string,
  workspaceId: string,
): Promise<boolean> => {
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!workspace) return false;
  return workspace.userId === userId;
};

export const getIsAdmin = async (workspaceId: string, userId: string) => {
  const member = await getMember({ workspaceId, userId });

  if (!member) {
    throw new Error("Unauthorized access");
  }

  return member.role === MemberRole.ADMIN;
};

export const createUserPaymentStatusInBD = async () => {
  try {
    const user = await getCurrent();
    if (!user) return;

    const existing = await db
      .select()
      .from(userPaymentStatus)
      .where(eq(userPaymentStatus.userId, user.$id))
      .limit(1);

    if (existing.length) return;

    await db.insert(userPaymentStatus).values({
      id: createId(),
      userId: user.$id,
      paymentStatus: PaymentStatus.Normal,
    });
  } catch (error) {
    console.error("Failed to seed user payment status:", error);
  }
};

export const getAttachedWith = async (userId: string) => {
  const memberOfWorkspace = await db
    .select()
    .from(members)
    .where(eq(members.userId, userId));

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
    .where(eq(tasks.assigneeId, userId));

  const projectIds = Array.from(
    new Set(assignedTasks.map((doc) => doc.projectId)),
  );

  return {
    workspaceIds,
    projectIds,
    workspaces: workspaceRows,
  };
};
