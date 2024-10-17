import { snakeCaseToTitleCase } from "@/lib/utils";
import { TaskStatus } from "../types";
import { ReactNode } from "react";
import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotDashedIcon,
  CircleDotIcon,
  CircleIcon,
  PlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import useCreateTaskModal from "../hooks/use-create-task-modal";

interface Props {
  board: TaskStatus;
  taskCount: number;
}

const statusIconMap: Record<TaskStatus, ReactNode> = {
  [TaskStatus.BACKLOG]: (
    <CircleDashedIcon className="size-[18px] text-pink-500" />
  ),
  [TaskStatus.TODO]: <CircleIcon className="size-[18px] text-red-500" />,
  [TaskStatus.IN_PROGRESS]: (
    <CircleDotDashedIcon className="size-[18px] text-yellow-500" />
  ),
  [TaskStatus.IN_REVIEW]: (
    <CircleDotIcon className="size-[18px] text-purple-500" />
  ),
  [TaskStatus.DONE]: (
    <CircleCheckIcon className="size-[18px] text-emerald-500" />
  ),
};

const KanbanBoardHeader = ({ board, taskCount }: Props) => {
  const { open } = useCreateTaskModal();
  const icon = statusIconMap[board];
  return (
    <div className="flex items-center justify-between px-2 py-1.5">
      <div className="flex items-center gap-x-2">
        {icon}
        <h2 className="text-sm font-medium">{snakeCaseToTitleCase(board)}</h2>
        <div className="flex size-5 items-center justify-center rounded-md bg-neutral-200 text-xs font-medium text-neutral-700">
          {taskCount}
        </div>
      </div>
      <Button onClick={open} variant={"ghost"} size={"icon"} className="size-5">
        <PlusIcon className="size-4 text-neutral-500" />
      </Button>
    </div>
  );
};

export default KanbanBoardHeader;
