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

const TaskViewSwitcher = () => {
  const workspaceId = useWorkspaceId();
  const { open } = useCreateTaskModal();

  const [{ status, assigneeId, projectId, dueDate, search }] = useTaskFilters();
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    status: status ?? undefined,
    assigneeId: assigneeId ?? undefined,
    projectId: projectId ?? undefined,
    dueDate: dueDate ?? undefined,
    search: search ?? undefined,
  });

  const [view, setView] = useQueryState("task-view", {
    defaultValue: "table",
  });

  return (
    <Tabs
      defaultValue={view}
      onValueChange={setView}
      className="w-full flex-1 rounded-lg border"
    >
      <div className="flex h-full flex-col overflow-auto p-4">
        <div className="flex flex-col items-center justify-between gap-y-2 lg:flex-row">
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger className="h-8 w-full lg:w-auto" value="table">
              Tab
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full lg:w-auto" value="kanban">
              Kanban
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full lg:w-auto" value="calender">
              Calender
            </TabsTrigger>
          </TabsList>
          <Button onClick={open} size={"sm"} className="w-full lg:w-auto">
            <PlusIcon className="mr-2 size-4" /> New
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <DataFilters />
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
              Data table
            </TabsContent>
            <TabsContent value={"kanban"} className="mt-0">
              Data kanban
            </TabsContent>
            <TabsContent value={"calender"} className="mt-0">
              Data calender
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};

export default TaskViewSwitcher;
