import { getCurrent } from "@/features/auth/server/queries";
import { redirect } from "next/navigation";
import WorkspaceIdClient from "./client";

const WorkspacePage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return <WorkspaceIdClient user={user} />;
};

export default WorkspacePage;
