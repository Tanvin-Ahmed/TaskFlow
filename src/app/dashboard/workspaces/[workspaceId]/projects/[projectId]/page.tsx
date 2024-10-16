import { Button } from "@/components/ui/button";
import { getCurrent } from "@/features/auth/server/queries";
import ProjectAvatar from "@/features/projects/components/project-avatar";
import { getProject } from "@/features/projects/queries";
import TaskViewSwitcher from "@/features/tasks/components/task-view-switcher";
import { PencilIcon } from "lucide-react";
import Link from "next/link";
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <ProjectAvatar
            name={initialProjectValue.name}
            image={initialProjectValue?.imageUrl}
            className="size-8"
          />
          <p className="text-lg font-semibold">{initialProjectValue.name}</p>
        </div>
        <div>
          <Button variant={"secondary"} size={"sm"} asChild>
            <Link
              href={`/workspaces/${initialProjectValue.workspaceId}/projects/${initialProjectValue.$id}/settings`}
            >
              <PencilIcon className="mr-2 size-3" /> Edit Project
            </Link>
          </Button>
        </div>
      </div>
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
