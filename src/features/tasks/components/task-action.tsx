import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";
import { ReactNode } from "react";
import { useDeleteTask } from "../api/use-delete-task";
import useConfirm from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";
import useUpdateTaskModal from "../hooks/use-update-task-modal";

interface Props {
  id: string;
  projectId: string;
  children: ReactNode;
}

const TaskAction = ({ children, id, projectId }: Props) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const { open } = useUpdateTaskModal();

  const { confirm, ConfirmationDialog } = useConfirm(
    "Delete task",
    "This action cannot be undone.",
    "destructive",
  );

  const { mutate: deleteTask, isPending: isLoadingDeleteTask } =
    useDeleteTask();

  const handleDeleteTask = async (taskId: string) => {
    const ok = await confirm();
    if (!ok) return;

    deleteTask({
      param: { taskId },
    });
  };

  const onOpenTask = () => {
    router.push(`/dashboard/workspaces/${workspaceId}/tasks/${id}`);
  };

  const onOpenProject = () => {
    router.push(`/dashboard/workspaces/${workspaceId}/projects/${projectId}`);
  };

  return (
    <div className="flex justify-end">
      <ConfirmationDialog />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={onOpenTask}
            className="p-[10px] font-medium"
          >
            <ExternalLinkIcon className="mr-2 size-4 stroke-2" /> Task Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onOpenProject}
            className="p-[10px] font-medium"
          >
            <ExternalLinkIcon className="mr-2 size-4 stroke-2" /> Open Project
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => open(id)}
            className="p-[10px] font-medium"
          >
            <PencilIcon className="mr-2 size-4 stroke-2" /> Edit Task
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleDeleteTask(id)}
            disabled={isLoadingDeleteTask}
            className="p-[10px] font-medium text-red-700 focus:text-red-700"
          >
            <TrashIcon className="mr-2 size-4 stroke-2" /> Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TaskAction;
