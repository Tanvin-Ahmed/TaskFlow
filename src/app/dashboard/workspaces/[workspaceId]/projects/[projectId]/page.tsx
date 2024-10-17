import { getCurrent } from "@/features/auth/server/queries";
import ProjectHeader from "@/features/projects/components/project-header";
import { getProject } from "@/features/projects/queries";
import TaskViewSwitcher from "@/features/tasks/components/task-view-switcher";
import { redirect } from "next/navigation";

interface Props {
  params: {
    projectId: string;
  };
}

const ProjectPage = async ({ params }: Props) => {
  const { projectId } = params;
  const user = await getCurrent();
  if (!user?.$id) redirect("/sign-in");

  const initialProjectValue = await getProject(projectId);

  return initialProjectValue ? (
    <section className="flex flex-col gap-y-4">
      <ProjectHeader initialValues={initialProjectValue} />
      <TaskViewSwitcher />
    </section>
  ) : (
    <section className="flex h-[75vh] w-full items-center justify-center">
      <h2 className="text-2xl font-bold text-muted-foreground">
        Project not found!
      </h2>
    </section>
  );
};

export default ProjectPage;
