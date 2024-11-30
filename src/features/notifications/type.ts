import { Models } from "node-appwrite";

export type Notification = Models.Document & {
  workspaceId: string;
  message: string;
  projectId?: string;
  to?: string;
  seenBy?: string;
  link?: string;
  taskId?: string;
  isMeetingNotification: boolean;
};

export type PopulatedNotification = Models.Document & {
  workspace: {
    $id: string;
    name: string;
    imageUrl: string;
  };
  message: string;
  project?: {
    $id: string;
    name: string;
    imageUrl: string;
  };
  taskId?: string;
  to?: string;
  seenBy?: string[];
  link?: string;
  isMeetingNotification: boolean;
};
