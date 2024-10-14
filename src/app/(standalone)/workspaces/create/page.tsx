import { getCurrent } from "@/features/auth/server/queries";
import CreateWorkspaceForm from "@/features/workspaces/components/create-workspace-form";
import { redirect } from "next/navigation";

const WorkspaceCreatePage = async () => {
  const user = await getCurrent();

  if (!user?.$id) redirect("/sign-in");

  return (
    <section className="w-full lg:max-w-xl">
      <CreateWorkspaceForm />
    </section>
  );
};

export default WorkspaceCreatePage;
