"use client";
import DottedSeparator from "@/components/custom/shared/dotted-separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon, Loader, MoreVerticalIcon } from "lucide-react";
import Link from "next/link";
import { useGetMembers } from "../api/use-get-members";
import { Fragment } from "react";
import MemberAvatar from "./member-avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateMember } from "../api/use-update-member";
import { useDeleteMember } from "../api/use-delete-member";
import { MemberRole } from "../types";
import useConfirm from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useCurrent } from "@/features/auth/api/use-current";

interface Props {
  workspaceId: string;
}

const MembersList = ({ workspaceId }: Props) => {
  const router = useRouter();

  const { data, isLoading } = useGetMembers({ workspaceId });
  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();
  const { mutate: deleteMember, isPending: isDeletingMember } =
    useDeleteMember();

  const { confirm, ConfirmationDialog } = useConfirm(
    "Remove member",
    "This member will be removed form the workspace.",
    "destructive",
  );
  const { data: currentUser } = useCurrent();

  const handleUpdateMember = async (
    memberId: string,
    memberRole: MemberRole,
  ) => {
    updateMember(
      {
        json: { role: memberRole },
        param: { memberId },
      },
      {
        onSuccess: () => {
          router.refresh();
        },
      },
    );
  };

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
    <Card className="-full w-full border-none bg-neutral-50 shadow-none dark:bg-purple-900/5">
      <ConfirmationDialog />
      <CardHeader className="flex flex-row items-center gap-x-4 space-y-0 p-7">
        <Button
          size={"icon"}
          variant={"secondary"}
          asChild
          className="flex items-center justify-center rounded-full"
        >
          <Link href={`/dashboard/workspaces/${workspaceId}`}>
            <ArrowLeftIcon className={"size-4"} />
          </Link>
        </Button>
        <CardTitle className="text-xl font-bold">Members List</CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader className="size-10 animate-spin text-muted-foreground" />
          </div>
        ) : !!data?.total ? (
          <div className="space-y-4">
            {data.documents.map((member, index) => {
              return (
                <Fragment key={member.$id}>
                  <div className="flex items-center gap-2">
                    <MemberAvatar
                      className="size-10"
                      fallbackClassName="text-lg"
                      name={member.name}
                    />
                    <div className="flex flex-col">
                      {" "}
                      <p className="text-sm font-medium">
                        {member.name}{" "}
                        {currentUser?.email === member.email ? (
                          <span className="rounded-md border-transparent bg-purple-200 p-1 text-[10px] text-purple-700 shadow-none dark:bg-purple-900/30">
                            me
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                    <div className="flex h-full w-full items-center justify-center">
                      <Badge
                        className={"text-[10px]"}
                        variant={
                          member.role === "ADMIN" ? "default" : "destructive"
                        }
                      >
                        {member.role}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="ml-auto"
                          variant={"secondary"}
                          size={"icon"}
                        >
                          <MoreVerticalIcon
                            className={"size-4 text-muted-foreground"}
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="bottom" align="end">
                        <DropdownMenuItem
                          className={"font-medium"}
                          onClick={() =>
                            handleUpdateMember(member.$id, MemberRole.ADMIN)
                          }
                          disabled={isUpdatingMember}
                        >
                          Set as Administrator
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className={"font-medium"}
                          onClick={() =>
                            handleUpdateMember(member.$id, MemberRole.MEMBER)
                          }
                          disabled={isUpdatingMember}
                        >
                          Set as Member
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className={"font-medium text-red-500"}
                          onClick={() => handleDeleteMember(member.$id)}
                          disabled={isDeletingMember}
                        >
                          Remove {member.name}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {index < data.documents.length - 1 && (
                    <Separator className={"my-2.5"} />
                  )}
                </Fragment>
              );
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default MembersList;
