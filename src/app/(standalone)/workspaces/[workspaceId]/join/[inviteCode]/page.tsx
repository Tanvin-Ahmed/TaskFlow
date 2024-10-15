import { getCurrent } from "@/features/auth/server/queries";
import JoinWorkspaceForm from "@/features/workspaces/components/join-workspace-form";
import { getWorkspaceName } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";

interface Props {
  params: {
    workspaceId: string;
  };
}

const WorkspaceIdJoinPage = async ({ params }: Props) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const { workspaceId } = params;

  const workspaceName = await getWorkspaceName(workspaceId);

  if (!workspaceName) redirect("/dashboard");

  return (
    <div className="w-full lg:max-w-xl">
      <JoinWorkspaceForm initialValue={workspaceName} />
    </div>
  );
};

export default WorkspaceIdJoinPage;
