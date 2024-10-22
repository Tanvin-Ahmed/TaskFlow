import { getCurrent } from "@/features/auth/server/queries";
import { redirect } from "next/navigation";
import WorkspaceIdClient from "./client";

const WorkspacePage = async () => {
  const user = getCurrent();
  if (!user) redirect("/sign-in");

  return <WorkspaceIdClient />;
};

export default WorkspacePage;
