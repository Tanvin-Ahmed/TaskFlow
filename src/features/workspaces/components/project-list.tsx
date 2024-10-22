"use client";
import DottedSeparator from "@/components/custom/shared/dotted-separator";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import useWorkspaceId from "../hooks/use-workspace-id";
import { Card, CardContent } from "@/components/ui/card";
import useCreateProjectModal from "@/features/projects/hooks/use-create-project-modal";
import { Project } from "@/features/projects/types";
import ProjectAvatar from "@/features/projects/components/project-avatar";
import { useTheme } from "next-themes";

interface Props {
  data: Project[];
  total: number;
}

const ProjectList = ({ data, total }: Props) => {
  const { resolvedTheme } = useTheme();

  const workspaceId = useWorkspaceId();
  const { open: createProject } = useCreateProjectModal();

  return (
    <div className="col-span-1 flex flex-col gap-y-4">
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Projects {total}</p>
          <Button
            variant={resolvedTheme === "dark" ? "outline" : "muted"}
            size={"icon"}
            onClick={createProject}
          >
            <PlusIcon className="size-4 text-neutral-400" />
          </Button>
        </div>
        <DottedSeparator className="my-4" />

        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.map((project) => (
            <li key={project.$id}>
              <Link
                href={`/dashboard/workspaces/${workspaceId}/projects/${project.$id}`}
              >
                <Card className="rounded-lg shadow-none transition hover:opacity-75">
                  <CardContent className="flex items-center gap-x-2.5 p-4">
                    <ProjectAvatar
                      name={project.name}
                      image={project?.imageId}
                      className="size-8 md:size-10 lg:size-12"
                      fallbackClassName="text-lg"
                    />
                    <p className="truncate text-lg font-medium">
                      {project.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          <li className="hidden text-center text-sm text-muted-foreground first-of-type:block">
            No projects found!
          </li>
        </ul>
        <Button
          variant={resolvedTheme === "dark" ? "outline" : "muted"}
          className="mt-4 w-full"
          asChild
        >
          <Link href={`/dashboard/workspaces/${workspaceId}/projects`}>
            Show All
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ProjectList;
