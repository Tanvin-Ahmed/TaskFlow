"use client";
import DottedSeparator from "@/components/custom/shared/dotted-separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader, PlusIcon } from "lucide-react";
import useCreateTaskModal from "../hooks/use-create-task-modal";
import useGetTasks from "../api/use-get-tasks";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";
import { useQueryState } from "nuqs";
import DataFilters from "./data-filters";
import useTaskFilters from "../hooks/use-task-filters";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import DataKanban from "./data-kanban";
import { useCallback } from "react";
import { TaskStatus } from "../types";
import { useBulkUpdateTasks } from "../api/use-bulk-update-tasks";
import DataCalender from "./data-calender";
import useProjectId from "@/features/projects/hooks/use-project-id";
import { Models } from "node-appwrite";

interface Props {
  hideProjectFilter?: boolean;
  hideAssigneeFilters?: boolean;
  user: Models.User<Models.Preferences>;
}

const TaskViewSwitcher = ({
  hideProjectFilter,
  hideAssigneeFilters,
  user,
}: Props) => {
  const workspaceId = useWorkspaceId();
  const urlProjectId = useProjectId();
  const { open, setStatusTo } = useCreateTaskModal();

  const { mutate: bulkUpdate } = useBulkUpdateTasks();
  const [{ status, assigneeId, projectId, dueDate, search }] = useTaskFilters();
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    status: status ?? undefined,
    assigneeId: assigneeId
      ? assigneeId
      : hideAssigneeFilters
        ? user.$id
        : undefined,
    projectId: hideProjectFilter ? urlProjectId : (projectId ?? undefined),
    dueDate: dueDate ?? undefined,
    search: search ?? undefined,
  });

  const [view, setView] = useQueryState("task-view", {
    defaultValue: "table",
  });

  const onKanbanChange = useCallback(
    (
      tasks: {
        $id: string;
        status: TaskStatus;
        position: number;
      }[],
    ) => {
      bulkUpdate({ json: { tasks } });
    },
    [bulkUpdate],
  );

  return (
    <Tabs
      defaultValue={view}
      onValueChange={setView}
      className="w-full flex-1 rounded-lg border"
    >
      <div className="flex h-full flex-col overflow-auto p-4">
        <div className="flex flex-col items-center justify-between gap-y-2 sm:flex-row">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger className="h-8 w-full sm:w-auto" value="table">
              Table
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full sm:w-auto" value="kanban">
              Kanban
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full sm:w-auto" value="calender">
              Calender
            </TabsTrigger>
          </TabsList>
          <Button
            onClick={() => {
              open();
              setStatusTo(null);
            }}
            size={"sm"}
            className="w-full sm:w-auto"
          >
            <PlusIcon className="mr-2 size-4" /> New
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <DataFilters
          hideProjectFilters={hideProjectFilter}
          hideAssigneeFilters={hideAssigneeFilters}
        />
        <DottedSeparator className="my-4" />
        {isLoadingTasks ? (
          <div
            className={
              "flex h-[200px] w-full flex-col items-center justify-center rounded-lg border"
            }
          >
            <Loader className={"size-5 animate-spin text-muted-foreground"} />
          </div>
        ) : (
          <>
            <TabsContent value={"table"} className="mt-0">
              <DataTable columns={columns} data={tasks?.documents || []} />
            </TabsContent>
            <TabsContent value={"kanban"} className="mt-0">
              <DataKanban
                data={tasks?.documents ?? []}
                onChange={onKanbanChange}
                user={user}
              />
            </TabsContent>
            <TabsContent value={"calender"} className="mt-0">
              <DataCalender data={tasks?.documents ?? []} />
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};

export default TaskViewSwitcher;
