export enum MemberRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export type Member = {
  role: MemberRole;
  name: string;
  email: string;
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
};
