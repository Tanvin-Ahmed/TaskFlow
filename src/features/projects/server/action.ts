"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { Project } from "../types";
import { DATABASE_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { Query } from "node-appwrite";
import { Task } from "@/features/tasks/types";

export const getAssignees = async (projectId: string) => {
  const { databases, account } = await createSessionClient();
  const user = await account.get();
  const { users } = await createAdminClient();

  const project = await databases.getDocument<Project>(
    DATABASE_ID,
    PROJECTS_ID,
    projectId,
  );

  const member = await getMember({
    databases,
    workspaceId: project.workspaceId,
    userId: user.$id,
  });

  if (!member) {
    return [];
  }

  // add main logic to get detail information of assignees
  const tasks = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID, [
    Query.equal("projectId", projectId),
  ]);
  const assigneeIds = Array.from(
    new Set(tasks.documents.map((doc) => doc.assigneeId)),
  );

  const userDetails = await users.list([Query.contains("$id", assigneeIds)]);

  const userDetailsWithoutSensitiveInfo = userDetails.total
    ? userDetails.users.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ password, hash, passwordUpdate, hashOptions, ...rest }) => rest,
      )
    : [];

  return userDetailsWithoutSensitiveInfo;
};
