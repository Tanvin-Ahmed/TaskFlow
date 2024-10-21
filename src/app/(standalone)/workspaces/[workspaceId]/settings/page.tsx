import { getCurrent } from "@/features/auth/server/queries";
import { redirect } from "next/navigation";
import WorkspaceSettingsClient from "./client";

const WorkspaceIdSettingsPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <section className="w-full lg:max-w-xl">
      <WorkspaceSettingsClient />
    </section>
  );
};

export default WorkspaceIdSettingsPage;
