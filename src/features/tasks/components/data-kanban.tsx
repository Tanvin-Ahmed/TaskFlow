"use client";
import { useCallback, useEffect, useState } from "react";
import { PopulatedTask, TaskStatus } from "../types";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import KanbanBoardHeader from "./kanban-board-header";
import KanbanCard from "./kanban-card";
import { Models } from "node-appwrite";
import { toast } from "sonner";

interface Props {
  data: PopulatedTask[];
  onChange: (
    task: {
      $id: string;
      status: TaskStatus;
      position: number;
    }[],
  ) => void;
  user: Models.User<Models.Preferences>;
}

const boards: TaskStatus[] = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];

type TasksState = {
  [key in TaskStatus]: PopulatedTask[];
};

const DataKanban = ({ data, onChange, user }: Props) => {
  const [tasks, setTasks] = useState<TasksState>(() => {
    const initialTasks: TasksState = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };

    data.forEach((task) => {
      initialTasks[task.status].push(task);
    });
    Object.keys(initialTasks).forEach((status) => {
      initialTasks[status as TaskStatus].sort(
        (a, b) => a.position - b.position,
      );
    });

    return initialTasks;
  });

  useEffect(() => {
    const newTasks: TasksState = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };

    data.forEach((task) => {
      newTasks[task.status].push(task);
    });
    Object.keys(newTasks).forEach((status) => {
      newTasks[status as TaskStatus].sort((a, b) => a.position - b.position);
    });

    setTasks(newTasks);
  }, [data]);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const { source, destination } = result;
      const sourceStatus = source.droppableId as TaskStatus;
      const destinationStatus = destination.droppableId as TaskStatus;

      // Retrieve the task being moved
      const taskToMove = tasks[sourceStatus][source.index];

      // Check if the logged-in user is the owner of the task
      if (taskToMove.assignee.$id !== user.$id) {
        return toast.error("Only assignee can update the task");
      }

      const updatesPayload: {
        $id: string;
        status: TaskStatus;
        position: number;
      }[] = [];
      setTasks((previousTask) => {
        const newTasks = { ...previousTask };
        // safely remove the task from source column
        const sourceColumn = [...newTasks[sourceStatus]];
        const [moveTask] = sourceColumn.splice(source.index, 1);

        // if there's no moved task (shouldn't happen, but just in case), return the previous state
        if (!moveTask) {
          return previousTask;
        }

        // create a new task object with potentially updated status
        const updatedMovedTask =
          sourceStatus !== destinationStatus
            ? { ...moveTask, status: destinationStatus }
            : moveTask;

        // Update the source column
        newTasks[sourceStatus] = sourceColumn;

        // Add the task to the destination column
        const destinationColumn = [...newTasks[destinationStatus]];
        destinationColumn.splice(destination.index, 0, updatedMovedTask);
        newTasks[destinationStatus] = destinationColumn;

        // prepare the minimal update payload
        // Always update the moved task
        updatesPayload.push({
          $id: updatedMovedTask.$id,
          status: destinationStatus,
          position: Math.min((destination.index + 1) * 1000, 1_000_000),
        });

        // update positions for affected tasks in the destination column
        newTasks[destinationStatus].forEach((task, index) => {
          if (task && task.$id !== updatedMovedTask.$id) {
            const newPosition = Math.min((index + 1) * 1000, 1_000_000);
            if (task.position !== newPosition) {
              updatesPayload.push({
                $id: task.$id,
                status: destinationStatus,
                position: newPosition,
              });
            }
          }
        });

        // If the task moved between columns, update positions in the source column
        if (sourceStatus !== destinationStatus) {
          newTasks[sourceStatus].forEach((task, index) => {
            if (task) {
              const newPosition = Math.min((index + 1) * 1000, 1_000_000);
              if (task.position !== newPosition) {
                updatesPayload.push({
                  $id: task.$id,
                  status: sourceStatus,
                  position: newPosition,
                });
              }
            }
          });
        }

        return newTasks;
      });

      onChange(updatesPayload);
    },
    [onChange, tasks, user.$id],
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="hide-scrollbar flex overflow-x-auto">
        {boards.map((board) => (
          <div
            key={board}
            className="mx-2 min-w-[200px] flex-1 rounded-md bg-muted p-1.5"
          >
            <KanbanBoardHeader board={board} taskCount={tasks[board].length} />
            <Droppable droppableId={board}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="min-h-[200px] py-1.5"
                >
                  {tasks[board].map((task, index) => (
                    <Draggable
                      key={task.$id}
                      draggableId={task.$id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          {...provided.dragHandleProps}
                          {...provided.draggableProps}
                          ref={provided.innerRef}
                        >
                          <KanbanCard task={task} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default DataKanban;
