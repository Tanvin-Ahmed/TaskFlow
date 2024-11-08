export type CreateDocumentParams = {
  userId: string;
  email: string;
  projectId: string;
  projectName: string;
  workspaceId: string;
};

type AccessType = ["room:write"] | ["room:read", "room:presence:write"];

export type RoomAccesses = Record<string, AccessType>;

export type RoomMetadata = {
  creatorId: string;
  email: string;
  title: string;
  projectId: string;
};
