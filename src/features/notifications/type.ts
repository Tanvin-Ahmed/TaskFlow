import { Models } from "node-appwrite";

export type Notification = Models.Document & {
  workspaceId: string;
  message: string;
  projectId?: string;
  to?: string;
  readAt?: Date;
  link?: string;
};

export type PopulatedNotification = Models.Document & {
  workspace: {
    $id: string;
    name: string;
  };
  message: string;
  project?: {
    $id: string;
    name: string;
  };
  to?: string;
  readAt?: Date;
  link?: string;
};
