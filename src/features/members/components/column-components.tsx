"use client";
import { Switch } from "@/components/ui/switch";
import { Row } from "@tanstack/react-table";
import { Member, MemberRole } from "../types";
import { useEffect, useState } from "react";
import { useUpdateMember } from "../api/use-update-member";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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

export const AdminSwitcher = ({ data }: { data: Row<Member> }) => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const role = data.getValue("role");
  const memberId = data.getValue("$id") as string;
  const memberName = data.getValue("name") as string;

  const { mutate } = useUpdateMember();

  useEffect(() => {
    setIsAdmin(() => role === MemberRole.ADMIN);
  }, [role]);

  const handleCheckedChange = (value: boolean) => {
    setIsAdmin(value);

    mutate(
      {
        json: { role: isAdmin ? MemberRole.ADMIN : MemberRole.MEMBER },
        param: { memberId },
      },
      {
        onSuccess: () => {
          toast.success(`${memberName} is now an admin.`);
          router.refresh();
        },
        onError: () => {
          setIsAdmin(role === MemberRole.ADMIN);
          toast.error("Something went wrong. Please try again.");
        },
      },
    );
  };

  return (
    <div className="flex items-center justify-center">
      <Switch checked={isAdmin} onCheckedChange={handleCheckedChange} />
    </div>
  );
};

export const MemberTableAction = ({ data }: { data: Row<Member> }) => {
  const router = useRouter();
  const name = data.getValue("name") as string;
  const $id = data.getValue("$id") as string;

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

    deleteMember(
      { param: { memberId } },
      {
        onSuccess: () => {
          router.refresh();
        },
      },
    );
  };

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
