import { getCurrent } from "@/features/auth/server/queries";
import { redirect } from "next/navigation";
import DocClient from "./client";
import CollaborativeRoom from "@/features/live-block/components/collaborative-room";
import { getDocument } from "@/features/live-block/server/actions";

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

  return (
    <section>
      <CollaborativeRoom>
        <DocClient user={user} />
      </CollaborativeRoom>
    </section>
  );
};

export default DocPage;
