import { Models } from "node-appwrite";

export type Project = Models.Document & {
  name: string;
  imageUrl?: string;
  userId: string;
  imageId?: string;
  workspaceId: string;
  docs?: string;
  canvas?: string;
};
