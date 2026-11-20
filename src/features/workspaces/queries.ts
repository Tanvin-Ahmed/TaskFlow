"use server";

import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { members, workspaces } from "@/db/schema";
import { toDocument } from "@/db/mappers";
import { getCurrent } from "@/features/auth/server/queries";
import { getMember } from "@/features/members/utils";
import { Workspace } from "./types";

export const getWorkspaces = async () => {
  const user = await getCurrent();
  if (!user) return { documents: [] as Workspace[], total: 0 };

  const memberships = await db
    .select()
    .from(members)
    .where(eq(members.userId, user.$id));

  if (!memberships.length) {
    return { documents: [] as Workspace[], total: 0 };
  }

  const workspaceIds = memberships.map((m) => m.workspaceId);
  const rows = await db
    .select()
    .from(workspaces)
    .where(inArray(workspaces.id, workspaceIds))
    .orderBy(desc(workspaces.createdAt));

  return {
    documents: rows.map((row) => toDocument(row) as Workspace),
    total: rows.length,
  };
};

export const getWorkspace = async (workspaceId: string) => {
  const user = await getCurrent();
  if (!user) return null;

  const member = await getMember({
    workspaceId,
    userId: user.$id,
  });
  if (!member) return null;

  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  return workspace ? (toDocument(workspace) as Workspace) : null;
};

export const getWorkspaceInfo = async (workspaceId: string) => {
  try {
    const [workspace] = await db
      .select({
        name: workspaces.name,
        id: workspaces.id,
      })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (!workspace) return null;
    return { name: workspace.name, $id: workspace.id };
  } catch {
    return null;
  }
};

export const getWorkspaceName = async (workspaceId: string) => {
  const [workspace] = await db
    .select({ name: workspaces.name })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!workspace) return null;
  return { name: workspace.name };
};

export const getWorkspaceInviteInfo = async (
  workspaceId: string,
  inviteCode: string,
) => {
  try {
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (!workspace) return null;
    if (workspace.inviteCode && workspace.inviteCode !== inviteCode) {
      return null;
    }

    return { name: workspace.name, $id: workspace.id };
  } catch {
    return null;
  }
};
