"use client";
import { ClientSideSuspense, RoomProvider } from "@liveblocks/react/suspense";
import { ReactNode } from "react";
import useProjectId from "@/features/projects/hooks/use-project-id";

interface Props {
  children: ReactNode;
}

const CollaborativeRoom = ({ children }: Props) => {
  const roomId = useProjectId();

  return (
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<div>Loading…</div>}>
        {children}
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default CollaborativeRoom;
