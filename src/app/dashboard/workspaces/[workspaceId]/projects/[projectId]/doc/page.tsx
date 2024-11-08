import { getCurrent, getUsers } from "@/features/auth/server/queries";
import { redirect } from "next/navigation";
import DocClient from "./client";
import CollaborativeRoom from "@/features/live-block/components/collaborative-room";
import { getDocument } from "@/features/live-block/server/actions";
import { RoomMetadata } from "@/features/live-block/types";

interface Props {
  params: {
    workspaceId: string;
    projectId: string;
  };
}

const DocPage = async ({ params }: Props) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const { projectId, workspaceId } = params;

  const room = await getDocument(user.email, projectId);
  if (!room) {
    redirect(`/dashboard/workspaces/${workspaceId}/projects/${projectId}`);
  }

  const userIds = Object.keys(room.usersAccesses);

  const usersInfo = await getUsers(userIds);

  const usersData = usersInfo
    .map((user) => {
      if (!user) return null;

      const permission = room.usersAccesses[user.email];

      return {
        ...user,
        userType: user && permission[0] === "room:write" ? "editor" : "viewer",
      };
    })
    .filter(Boolean);

  const currentUserType =
    room.usersAccesses[user.email][0] === "room:write" ? "editor" : "viewer";

  return (
    <section>
      <CollaborativeRoom>
        <DocClient
          metadata={room.metadata as RoomMetadata}
          users={usersData}
          currentUserType={currentUserType}
        />
      </CollaborativeRoom>
    </section>
  );
};

export default DocPage;
