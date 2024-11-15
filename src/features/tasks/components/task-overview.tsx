"use client";
import { Button } from "@/components/ui/button";
import { PopulatedTask } from "../types";
import { PencilIcon } from "lucide-react";
import DottedSeparator from "@/components/custom/shared/dotted-separator";
import OverviewProperty from "./overview-property";
import MemberAvatar from "@/features/members/components/member-avatar";
import TaskDate from "./task-date";
import { Badge } from "@/components/ui/badge";
import { snakeCaseToTitleCase } from "@/lib/utils";
import useUpdateTaskModal from "../hooks/use-update-task-modal";

interface Props {
  task: PopulatedTask;
}

const TaskOverview = ({ task }: Props) => {
  const { open } = useUpdateTaskModal();

  return (
    <div className="col-span-1 flex flex-col gap-y-4">
      <div className="rounded-lg bg-muted p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Overview</p>
          <Button
            onClick={() => open(task.$id)}
            size={"sm"}
            variant={"outline"}
          >
            <PencilIcon className="mr-2 size-3" />
            Edit
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <div className="flex flex-col gap-y-4">
          <OverviewProperty label="Assignee">
            <MemberAvatar name={task.assignee.name} className="size-6" />
            <p className="text-sm font-medium">{task.assignee.name}</p>
          </OverviewProperty>
          <OverviewProperty label="Due Date">
            <TaskDate value={task.dueDate} className="text-sm font-medium" />
          </OverviewProperty>
          <OverviewProperty label="Status">
            <Badge variant={task.status}>
              {snakeCaseToTitleCase(task.status)}
            </Badge>
          </OverviewProperty>
        </div>
      </div>
    </div>
  );
};

export default TaskOverview;
