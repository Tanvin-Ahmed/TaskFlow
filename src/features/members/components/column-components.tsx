"use client";
import { Switch } from "@/components/ui/switch";
import { Row } from "@tanstack/react-table";
import { Member, MemberRole } from "../types";
import { useEffect, useState } from "react";
import { useUpdateMember } from "../api/use-update-member";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVerticalIcon } from "lucide-react";
import useConfirm from "@/hooks/use-confirm";
import { useDeleteMember } from "../api/use-delete-member";
import { useGetUserIsOwner } from "@/features/workspaces/api/use-get-user-isOwner";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";

export const AdminSwitcher = ({ data }: { data: Row<Member> }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const role = data.original.role;
  const memberId = data.original["$id"] as string;
  const memberName = data.original.name as string;

  const { mutate } = useUpdateMember();

  useEffect(() => {
    setIsAdmin(() => role === MemberRole.ADMIN);
  }, [role]);

  const handleCheckedChange = (value: boolean) => {
    setIsAdmin(value);

    mutate(
      {
        json: { role: value ? MemberRole.ADMIN : MemberRole.MEMBER },
        param: { memberId },
      },
      {
        onSuccess: () => {
          toast.success(
            `${memberName} is now ${value ? "an admin" : "a member"} of this workspace.`,
          );
        },
        onError: () => {
          setIsAdmin(role === MemberRole.ADMIN);
        },
      },
    );
  };

  return (
    <div className="flex items-center">
      <Switch
        checked={isAdmin}
        onCheckedChange={(e) => handleCheckedChange(e)}
      />
    </div>
  );
};

export const MemberTableAction = ({ data }: { data: Row<Member> }) => {
  const name = data.original["name"] as string;
  const $id = data.original["$id"] as string;

  const workspaceId = useWorkspaceId();
  const { data: isOwner } = useGetUserIsOwner({ workspaceId });
  const { mutate: deleteMember, isPending: isDeletingMember } =
    useDeleteMember();
  const { confirm, ConfirmationDialog } = useConfirm(
    "Remove member",
    "This member will be removed form the workspace.",
    "destructive",
  );

  const handleDeleteMember = async (memberId: string) => {
    const ok = await confirm();
    if (!ok) return;

    deleteMember({ param: { memberId } });
  };

  if (!isOwner) return null;

  return (
    <>
      <ConfirmationDialog />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="ml-auto" variant={"secondary"} size={"icon"}>
            <MoreVerticalIcon className={"size-4 text-muted-foreground"} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuItem
            className={"font-medium text-red-500"}
            onClick={() => handleDeleteMember($id)}
            disabled={isDeletingMember}
          >
            Remove {name}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
