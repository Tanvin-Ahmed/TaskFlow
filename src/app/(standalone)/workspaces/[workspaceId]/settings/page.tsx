import { getCurrent } from "@/features/auth/server/action";
import { getWorkspace } from "@/features/workspaces/action";
import UpdateWorkspaceForm from "@/features/workspaces/components/update-workspace-form";
import { redirect } from "next/navigation";

interface Props {
  params: {
    workspaceId: string;
  };
}

const WorkspaceIdSettingsPage = async ({ params }: Props) => {
  const { workspaceId } = params;
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const initialValues = await getWorkspace(workspaceId);
  if (!initialValues) redirect(`/workspaces/${workspaceId}`);

  return (
    <section className="w-full lg:max-w-xl">
      <UpdateWorkspaceForm initialValue={initialValues} />
    </section>
  );
};

export default WorkspaceIdSettingsPage;
