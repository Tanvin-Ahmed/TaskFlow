export type Project = {
  $id: string;
  name: string;
  imageUrl?: string;
  userId: string;
  imageId?: string;
  workspaceId: string;
  docs?: string;
  canvas?: string;
  docPermissionMemberList?: string | string[];
  isDocCreated?: boolean | string;
  $createdAt?: string;
  $updatedAt?: string;
};
