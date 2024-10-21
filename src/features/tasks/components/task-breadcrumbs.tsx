"use client";
import { Project } from "@/features/projects/types";
import { Task } from "../types";
import ProjectAvatar from "@/features/projects/components/project-avatar";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";
import { Loader, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useDeleteTask } from "../api/use-delete-task";
import useConfirm from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";

interface Props {
  project: Project;
  task: Task;
}

const TaskBreadcrumbs = ({ project, task }: Props) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useDeleteTask();
  const { ConfirmationDialog, confirm } = useConfirm(
    "Delete task",
    "This action cannot be undone.",
    "destructive",
  );

  const handleDeleteTask = async () => {
    const ok = await confirm();
    if (!ok) return;

    mutate(
      { param: { taskId: task.$id } },
      {
        onSuccess: () => {
          router.push(`/dashboard/workspaces/${workspaceId}/tasks`);
        },
      },
    );
  };

  return (
    <div className="flex items-center gap-x-2">
      <ConfirmationDialog />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href={`/dashboard/workspaces/${workspaceId}/projects/${project.$id}`}
              className="flex items-center justify-start gap-x-2"
            >
              <ProjectAvatar
                name={project.name}
                image={project?.imageUrl}
                className="size-6 sm:size-8"
              />
              <span className="truncate">{project.name}</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="truncate">{task.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button
        onClick={handleDeleteTask}
        className="ml-auto"
        variant={"destructive"}
        size={"sm"}
        disabled={isPending}
      >
        {isPending ? (
          <Loader className="size-4 animate-spin" />
        ) : (
          <>
            <TrashIcon className="size-4 sm:mr-2" />{" "}
            <span className="hidden sm:block">Delete Task</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default TaskBreadcrumbs;
