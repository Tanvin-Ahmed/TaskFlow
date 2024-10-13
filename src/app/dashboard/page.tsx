import { getCurrent } from "@/features/auth/server/action";
import CreateWorkspaceForm from "@/features/workspaces/components/create-workspace-form";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  const user = await getCurrent();

  if (!user) redirect("/sign-in");

  return (
    <section className="w-full">
      <CreateWorkspaceForm />
    </section>
  );
};

export default Dashboard;
