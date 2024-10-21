import { getCurrent } from "@/features/auth/server/queries";
import { redirect } from "next/navigation";
import ProjectIdClient from "./client";

const ProjectPage = async () => {
  const user = await getCurrent();
  if (!user?.$id) redirect("/sign-in");

  return <ProjectIdClient />;
};

export default ProjectPage;
