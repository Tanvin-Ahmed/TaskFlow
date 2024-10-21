import { getCurrent } from "@/features/auth/server/queries";
import { redirect } from "next/navigation";
import ProjectSettingsClient from "./client";

const ProjectSettingPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return <ProjectSettingsClient />;
};

export default ProjectSettingPage;
