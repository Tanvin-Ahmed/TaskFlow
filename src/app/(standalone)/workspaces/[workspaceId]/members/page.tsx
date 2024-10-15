import { getCurrent } from "@/features/auth/server/queries";
import MembersList from "@/features/members/components/members-list";
import { redirect } from "next/navigation";

interface Props {
  params: {
    workspaceId: string;
  };
}

const WorkspaceIdMembersPage = async ({ params }: Props) => {
  const { workspaceId } = params;
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <section className="w-full lg:max-w-xl">
      <MembersList workspaceId={workspaceId} />
    </section>
  );
};

export default WorkspaceIdMembersPage;
