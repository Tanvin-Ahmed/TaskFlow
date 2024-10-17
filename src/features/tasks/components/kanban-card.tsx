import DottedSeparator from "@/components/custom/shared/dotted-separator";
import { PopulatedTask } from "../types";
import TaskAction from "./task-action";
import { MoreHorizontal } from "lucide-react";
import MemberAvatar from "@/features/members/components/member-avatar";
import TaskDate from "./task-date";
import ProjectAvatar from "@/features/projects/components/project-avatar";

interface Props {
  task: PopulatedTask;
}

const KanbanCard = ({ task }: Props) => {
  return (
    <div className="mb-1.5 space-y-3 rounded bg-white p-2.5 shadow-sm dark:bg-gray-950/50">
      <div className="flex items-start justify-between gap-x-2">
        <p className="line-clamp-2 text-sm">{task.name}</p>
        <TaskAction id={task.$id} projectId={task.projectId}>
          <MoreHorizontal className="size-[18px] shrink-0 stroke-1 text-neutral-700 transition hover:opacity-75 dark:text-neutral-400" />
        </TaskAction>
      </div>
      <DottedSeparator />
      <div className="flex items-center gap-1.5">
        <MemberAvatar
          name={task.assignee.name}
          fallbackClassName="text-[10px]"
          className="size-5"
        />
        <div className="size-1 rounded-full bg-neutral-300 dark:bg-purple-600" />
        <TaskDate value={task.dueDate} className="text-xs" />
      </div>
      <div className="flex items-center gap-x-1.5">
        <ProjectAvatar
          name={task.project.name}
          image={task.project.imageUrl}
          className="size-5"
          fallbackClassName="text-[10px]"
        />
        <span className="truncate text-xs font-medium">
          {task.project.name}
        </span>
      </div>
    </div>
  );
};

export default KanbanCard;
