"use client";

import DottedSeparator from "@/components/custom/shared/dotted-separator";
import { Button } from "@/components/ui/button";
import useCreateTaskModal from "@/features/tasks/hooks/use-create-task-modal";
import { PopulatedTask } from "@/features/tasks/types";
import { CalendarIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import useWorkspaceId from "../hooks/use-workspace-id";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "next-themes";

interface Props {
  data: PopulatedTask[];
  total: number;
}

const TaskList = ({ data, total }: Props) => {
  const { resolvedTheme } = useTheme();
  const workspaceId = useWorkspaceId();
  const { open: createTask } = useCreateTaskModal();

  return (
    <div className="col-span-1 flex flex-col gap-y-4">
      <div className="rounded-lg bg-muted p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Tasks {total}</p>
          <Button
            variant={resolvedTheme === "dark" ? "outline" : "muted"}
            size={"icon"}
            onClick={createTask}
          >
            <PlusIcon className="size-4 text-neutral-400" />
          </Button>
        </div>
        <DottedSeparator className="my-4" />

        <ul className="flex flex-col gap-y-4">
          {data.map((task) => (
            <li key={task.$id}>
              <Link
                href={`/dashboard/workspaces/${workspaceId}/tasks/${task.$id}`}
              >
                <Card className="rounded-lg shadow-none transition hover:opacity-75">
                  <CardContent className="p-4">
                    <p className="truncate text-lg font-medium">{task.name}</p>
                    <div className="flex items-center gap-x-2">
                      <p className="">{task.project?.name}</p>
                      <div className="size-1 rounded-full bg-neutral-300" />
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="mr-1 size-3" />
                        <span className="truncate">
                          {formatDistanceToNow(new Date(task.dueDate))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          <li className="hidden text-center text-sm text-muted-foreground first-of-type:block">
            No tasks found!
          </li>
        </ul>
        <Button
          variant={resolvedTheme === "dark" ? "outline" : "muted"}
          className="mt-4 w-full"
          asChild
        >
          <Link href={`/dashboard/workspaces/${workspaceId}/tasks`}>
            Show All
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default TaskList;
