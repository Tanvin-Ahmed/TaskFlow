import { Query } from "node-appwrite";
import { DATABASE_ID, WORKSPACES_ID, MEMBERS_ID } from "@/config";
import { getMember } from "../members/utils";
import { Workspace } from "./types";
import { createSessionClient } from "@/lib/appwrite";

export const getWorkspaces = async () => {
  const { account, databases } = await createSessionClient();

  const user = await account.get();

  const members = await databases.listDocuments(DATABASE_ID, MEMBERS_ID, [
    Query.equal("userId", user.$id),
  ]);

  if (members.total === 0) {
    return { documents: [], total: 0 };
  }

  const workspaceIds = members.documents.map((doc) => doc.workspaceId);

  const workspaces = await databases.listDocuments(DATABASE_ID, WORKSPACES_ID, [
    Query.orderDesc("$createdAt"),
    Query.contains("$id", workspaceIds),
  ]);

  return workspaces;
};

export const getWorkspace = async (workspaceId: string) => {
  const { account, databases } = await createSessionClient();

  const user = await account.get();

  const member = await getMember({
    databases,
    userId: user.$id,
    workspaceId,
  });

  if (!member) throw new Error("Unauthorized");

  const workspace = await databases.getDocument<Workspace>(
    DATABASE_ID,
    WORKSPACES_ID,
    workspaceId,
  );

  return workspace;
};

export const getWorkspaceName = async (workspaceId: string) => {
  const { databases } = await createSessionClient();

  const workspace = await databases.getDocument<Workspace>(
    DATABASE_ID,
    WORKSPACES_ID,
    workspaceId,
  );

  return { name: workspace.name };
};
