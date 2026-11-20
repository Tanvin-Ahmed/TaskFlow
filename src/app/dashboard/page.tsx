import { getCurrent } from "@/features/auth/server/queries";
import { getWorkspaces } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";

type Props = {
  searchParams: {
    upgraded?: string;
  };
};

const Dashboard = async ({ searchParams }: Props) => {
  const user = await getCurrent();
  const workspaces = await getWorkspaces();

  if (!user) redirect("/sign-in");

  const upgradedQuery =
    searchParams.upgraded === "1" ? "?upgraded=1" : "";

  if (!workspaces.total) {
    redirect(`/workspaces/create${upgradedQuery}`);
  } else {
    redirect(
      `/dashboard/workspaces/${workspaces.documents[0].$id}${upgradedQuery}`,
    );
  }
};

export default Dashboard;
