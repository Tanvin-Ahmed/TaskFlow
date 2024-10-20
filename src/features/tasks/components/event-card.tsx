"use client";

import { cn } from "@/lib/utils";
import { TaskStatus } from "../types";
import MemberAvatar from "@/features/members/components/member-avatar";
import ProjectAvatar from "@/features/projects/components/project-avatar";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";
import { useRouter } from "next/navigation";
import { MouseEvent } from "react";

interface Props {
  id: string;
  title: string;
  status: TaskStatus;
  assignee: {
    name: string;
    email: string;
    $id: string;
  };
  project: {
    name: string;
    imageUrl?: string;
    $id: string;
  };
}

const statusColorMap: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: "border-l-pink-500",
  [TaskStatus.TODO]: "border-l-red-500",
  [TaskStatus.IN_PROGRESS]: "border-l-yellow-500",
  [TaskStatus.IN_REVIEW]: "border-l-purple-500",
  [TaskStatus.DONE]: "border-l-emerald-500",
};

const EventCard = ({ assignee, id, project, status, title }: Props) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const handleGoToTaskPage = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    router.push(`/workspace/${workspaceId}/task/${id}`);
  };

  return (
    <div className="px-2">
      <div
        onClick={handleGoToTaskPage}
        className={cn(
          "flex cursor-pointer flex-col gap-y-1.5 rounded-md border border-l-4 bg-transparent p-1.5 text-xs text-primary transition hover:opacity-75",
          statusColorMap[status],
        )}
      >
        <p>{title}</p>
        <div className="flex items-center gap-x-1">
          <MemberAvatar name={assignee.name} className="size-5" />
          <div className="size-1 rounded-full bg-neutral-300" />
          <ProjectAvatar name={project.name} image={project.imageUrl} />
        </div>
      </div>
    </div>
  );
};

export default EventCard;
