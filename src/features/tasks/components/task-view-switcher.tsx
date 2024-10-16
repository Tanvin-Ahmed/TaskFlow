"use client";

import DottedSeparator from "@/components/custom/shared/dotted-separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon } from "lucide-react";
import useCreateTaskModal from "../hooks/use-create-task-modal";

const TaskViewSwitcher = () => {
  const { open } = useCreateTaskModal();

  return (
    <Tabs className="w-full flex-1 rounded-lg border">
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
        {/* TODO: Add filters */}
        <DottedSeparator className="my-4" />
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
      </div>
    </Tabs>
  );
};

export default TaskViewSwitcher;
