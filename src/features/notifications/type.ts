import { Models } from "node-appwrite";

export type Notification = Models.Document & {
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
};
