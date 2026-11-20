"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, tasks } from "@/db/schema";
import { getCurrent } from "@/features/auth/server/queries";
import { getMember } from "@/features/members/utils";
import { getClerkUsersByIds } from "@/lib/clerk-user";

export const getAssignees = async (projectId: string) => {
  const user = await getCurrent();
  if (!user) return [];

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) return [];

  const member = await getMember({
    workspaceId: project.workspaceId,
    userId: user.$id,
  });

  if (!member) return [];

  const taskRows = await db
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, projectId));

  if (!taskRows.length) return [];

  const assigneeIds = Array.from(
    new Set(taskRows.map((doc) => doc.assigneeId)),
  );

  return getClerkUsersByIds(assigneeIds);
};
