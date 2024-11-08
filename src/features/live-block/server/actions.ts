"use server";
import { revalidatePath } from "next/cache";
import { CreateDocumentParams, RoomAccesses } from "../types";
import { liveblocks } from "./route";
import { getIsOwner, getWorkspaceUsers } from "@/features/auth/server/queries";

export const createDocument = async ({
  userId,
  email,
  projectId,
  projectName,
  workspaceId,
}: CreateDocumentParams) => {
  const roomId = projectId;

  try {
    // check is the creator of the document is creator or not
    const isOwner = await getIsOwner(userId, workspaceId);

    if (!isOwner) {
      throw new Error("Only workspace owner can create documents");
    }

    const usersInfo = await getWorkspaceUsers(workspaceId);

    const usersWithoutCreator = usersInfo.users?.filter(
      (user) => user.email !== email,
    );

    const usersAccesses: RoomAccesses = {
      [email]: ["room:write"],
    };

    usersWithoutCreator.forEach((user) => {
      usersAccesses[user.email] = ["room:read", "room:presence:write"];
    });

    const metadata = {
      creatorId: userId,
      email,
      title: projectName,
      projectId,
    };

    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: ["room:write"],
    });

    revalidatePath("/dashboard/workspaces");

    return room;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const getDocument = async (userId: string, roomId: string) => {
  const room = await liveblocks.getRoom(roomId);

  const hasAccess = Object.keys(room.usersAccesses).includes(userId);
  if (!hasAccess) {
    return null;
  }

  return room;
};

export const getDocumentUsers = async ({
  roomId,
  currentUser,
  text,
}: {
  roomId: string;
  currentUser: string;
  text: string;
}) => {
  const room = await liveblocks.getRoom(roomId);
  const otherUsers = Object.keys(room.usersAccesses).filter(
    (email) => email !== currentUser,
  );

  if (text.trim().length) {
    const lowerCaseText = text.trim().toLowerCase();

    const filteredUsers = otherUsers.filter((email) =>
      email.toLowerCase().includes(lowerCaseText),
    );

    return filteredUsers;
  }

  return otherUsers;
};
