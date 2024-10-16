import { getCurrent } from "@/features/auth/server/queries";
import UpdateProjectForm from "@/features/projects/components/update-project-form";
import { getProject } from "@/features/projects/queries";
import { redirect } from "next/navigation";

interface Props {
  params: {
    workspaceId: string;
    projectId: string;
  };
}

const ProjectSettingPage = async ({ params }: Props) => {
  const { projectId } = params;
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const initialProjectValue = await getProject(projectId);

  return (
    <section className="w-full lg:max-w-xl">
      <UpdateProjectForm initialValue={initialProjectValue} />
    </section>
  );
};

export default ProjectSettingPage;
