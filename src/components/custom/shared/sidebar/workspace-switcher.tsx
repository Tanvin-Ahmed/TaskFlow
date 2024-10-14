"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import WorkspaceAvatar from "@/features/workspaces/components/workspace-avatar";
import useCreateWorkspaceModal from "@/features/workspaces/hooks/use-create-workspace-modal";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";

const WorkspaceSwitcher = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { open } = useCreateWorkspaceModal();
  const { data: workspaces, isLoading } = useGetWorkspaces();

  const onSelect = (id: string) => {
    console.log(id);
    router.push(`/dashboard/workspaces/${id}`);
  };

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500 dark:text-neutral-50">
          Workspaces
        </p>
        <RiAddCircleFill
          onClick={open}
          className="size-5 cursor-pointer text-neutral-500 transition hover:opacity-75 dark:text-neutral-50"
        />
      </div>
      <Select onValueChange={onSelect} value={workspaceId}>
        <SelectTrigger className="w-full bg-neutral-200 p-1 font-medium">
          <SelectValue placeholder="No workspace selected" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex w-full items-center justify-center p-3">
              <Loader className="size-9 animate-spin" />
            </div>
          ) : workspaces && !!workspaces?.total ? (
            workspaces.documents.map((ws) => (
              <SelectItem key={ws.$id} value={ws.$id}>
                <div className="flex items-center justify-start gap-3 font-medium">
                  <WorkspaceAvatar name={ws.name} image={ws.imageUrl} />
                  <span className="truncate">{ws.name}</span>
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="flex w-full items-center justify-center p-1">
              <small className="text-xs text-muted-foreground">
                No workspace available!
              </small>
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default WorkspaceSwitcher;
