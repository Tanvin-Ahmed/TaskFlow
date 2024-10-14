import { getCurrent } from "@/features/auth/server/action";
import { getWorkspaces } from "@/features/workspaces/action";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  const user = await getCurrent();
  const workspaces = await getWorkspaces();

  if (!user) redirect("/sign-in");

  if (!workspaces.total) {
    redirect("/workspaces/create");
  } else {
    redirect(`/dashboard/workspaces/${workspaces.documents[0].$id}`);
  }
};

export default Dashboard;
