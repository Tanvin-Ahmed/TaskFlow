"use server";
import { revalidatePath } from "next/cache";
import { CreateDocumentParams, RoomAccesses } from "../types";
import { liveblocks } from "./route";

export const createDocument = async ({
  userId,
  email,
  projectId,
  projectName,
}: CreateDocumentParams) => {
  const roomId = projectId;

  try {
    const usersAccesses: RoomAccesses = {
      [email]: ["room:write"],
    };

    const metadata = {
      creatorId: userId,
      email,
      title: projectName,
      projectId,
    };

    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: [],
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

// type ShareDocumentParams = {
//   roomId: string;
//   email: string;
//   userType: UserType;
//   updatedBy: string;
//   pathToRevalidate: string;
// };

// export const updateDocumentAccess = async ({
//   roomId,
//   email,
//   userType,
//   // updatedBy,
//   pathToRevalidate,
// }: ShareDocumentParams) => {
//   const usersAccesses: RoomAccesses = {
//     [email]: getAccessType(userType) as AccessType,
//   };

//   const room = await liveblocks.updateRoom(roomId, { usersAccesses });

//   if (room) {
//     // TODO: send a notification to the user
//   }

//   revalidatePath(pathToRevalidate);
// };

// export const removeCollaborator = async ({
//   roomId,
//   email,
//   pathToRevalidate,
// }: {
//   roomId: string;
//   email: string;
//   pathToRevalidate: string;
// }) => {
//   const room = await liveblocks.getRoom(roomId);

//   if (room.metadata.email === email) {
//     throw new Error("You cannot remove yourself from the document");
//   }

//   const updateRoom = await liveblocks.updateRoom(roomId, {
//     usersAccesses: {
//       [email]: null,
//     },
//   });

//   revalidatePath(pathToRevalidate);
//   return updateRoom;
// };
