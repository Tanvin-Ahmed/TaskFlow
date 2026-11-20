import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { members } from "@/db/schema";
import { toDocument } from "@/db/mappers";
import { Member, MemberRole } from "./types";

interface Params {
  workspaceId: string;
  userId: string;
}

export const getMember = async ({
  workspaceId,
  userId,
}: Params): Promise<Member | null> => {
  const [row] = await db
    .select()
    .from(members)
    .where(
      and(eq(members.workspaceId, workspaceId), eq(members.userId, userId)),
    )
    .limit(1);

  if (!row) return null;

  const doc = toDocument(row);
  return {
    ...doc,
    workspaceId: row.workspaceId,
    userId: row.userId,
    role: row.role as MemberRole,
    name: "",
    email: "",
    $id: row.id,
  };
};
