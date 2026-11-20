import { getCurrent } from "@/features/auth/server/queries";
import JoinWorkspaceForm from "@/features/workspaces/components/join-workspace-form";
import { getWorkspaceInviteInfo } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";

interface Props {
  params: {
    workspaceId: string;
    inviteCode: string;
  };
}

const WorkspaceIdJoinPage = async ({ params }: Props) => {
  const { workspaceId, inviteCode } = params;
  const invitePath = `/workspaces/${workspaceId}/join/${inviteCode}`;
  const signInHref = `/sign-in?callbackUrl=${encodeURIComponent(invitePath)}`;

  const user = await getCurrent();
  if (!user) {
    redirect(signInHref);
  }

  const workspace = await getWorkspaceInviteInfo(workspaceId, inviteCode);

  if (!workspace) {
    redirect("/dashboard");
  }

  return (
    <div className="w-full lg:max-w-xl">
      <JoinWorkspaceForm initialValue={workspace} />
    </div>
  );
};

export default WorkspaceIdJoinPage;
