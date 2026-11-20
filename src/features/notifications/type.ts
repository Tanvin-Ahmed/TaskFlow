export type Notification = {
  $id: string;
  workspaceId: string;
  message: string;
  projectId?: string;
  to?: string;
  seenBy?: string | string[];
  link?: string;
  taskId?: string;
  isMeetingNotification: boolean;
  $createdAt?: string;
  $updatedAt?: string;
};

export type PopulatedNotification = {
  $id: string;
  workspace: {
    $id: string;
    name: string;
    imageUrl?: string;
  };
  message: string;
  project?: {
    $id: string;
    name: string;
    imageUrl?: string;
  } | null;
  taskId?: string;
  to?: string;
  seenBy?: string[];
  link?: string;
  isMeetingNotification: boolean;
  $createdAt?: string;
};
