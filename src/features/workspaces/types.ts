import { Models } from "node-appwrite";

export type Workspace = Models.Document & {
  name: string;
  imageId?: string;
  imageUrl?: string;
  inviteCode: string;
  userId: string;
};
