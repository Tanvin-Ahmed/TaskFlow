"use client";

import { Button } from "@/components/ui/button";
import { DEFAULT_VALUES } from "@/constant/values";
import useGetProjects from "@/features/projects/api/use-get-projects";
import ProjectAvatar from "@/features/projects/components/project-avatar";
import useCreateProjectModal from "@/features/projects/hooks/use-create-project-modal";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";

const Projects = () => {
  const pathname = usePathname();
  const workspaceId = useWorkspaceId();
  const { open } = useCreateProjectModal();
  const { data, isLoading } = useGetProjects({ workspaceId });

  // TODO: if user is pro then user can create unlimited projects otherwise only 5 projects can be created per workspace
  const isProUser = false;

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500 dark:text-neutral-50">
          Projects
        </p>
        <Button
          size={"icon"}
          className="m-0 size-5 rounded-full p-0"
          disabled={
            isProUser
              ? false
              : data
                ? data.total >=
                  DEFAULT_VALUES.FREE_VERSION_PROJECT_COUNT_PER_WORKSPACE
                : false
          }
        >
          <RiAddCircleFill
            onClick={open}
            className="size-5 cursor-pointer text-neutral-500 transition hover:opacity-75 dark:text-neutral-50"
          />
        </Button>
      </div>
      {isLoading ? (
        <div className="flex w-full items-center justify-center p-3">
          <Loader className="size-5 animate-spin" />
        </div>
      ) : data && !!data.total ? (
        data.documents.map((project) => {
          const href = `/dashboard/workspaces/${workspaceId}/projects/${project.$id}`;
          const isActive = pathname === href;

          return (
            <Link key={project.$id} href={href}>
              <div
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-md p-2.5 text-neutral-500 transition hover:opacity-75",
                  {
                    "bg-white text-primary shadow-sm hover:opacity-100 dark:bg-purple-950/20":
                      isActive,
                  },
                )}
              >
                <ProjectAvatar image={project.imageUrl} name={project.name} />
                <span className={"truncate"}>{project.name}</span>
              </div>
            </Link>
          );
        })
      ) : (
        <div className="flex w-full items-center justify-center p-1">
          <small className="text-xs text-muted-foreground">
            No projects available!
          </small>
        </div>
      )}
    </div>
  );
};

export default Projects;
