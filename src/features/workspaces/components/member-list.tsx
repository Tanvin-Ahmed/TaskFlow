"use client";
import DottedSeparator from "@/components/custom/shared/dotted-separator";
import { Button } from "@/components/ui/button";
import { SettingsIcon } from "lucide-react";
import Link from "next/link";
import useWorkspaceId from "../hooks/use-workspace-id";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { Member } from "@/features/members/types";
import MemberAvatar from "@/features/members/components/member-avatar";

interface Props {
  data: Member[];
  total: number;
}

const MemberList = ({ data, total }: Props) => {
  const { resolvedTheme } = useTheme();
  const workspaceId = useWorkspaceId();

  return (
    <div className="col-span-1 flex flex-col gap-y-4">
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Members {total}</p>
          <Button
            variant={resolvedTheme === "dark" ? "outline" : "muted"}
            size={"icon"}
            asChild
          >
            <Link href={`/workspaces/${workspaceId}/members`}>
              <SettingsIcon className="size-4 text-neutral-400" />
            </Link>
          </Button>
        </div>
        <DottedSeparator className="my-4" />

        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((member) => (
            <li key={member.$id}>
              <Card className="overflow-hidden rounded-lg shadow-none">
                <CardContent className="flex flex-col items-center gap-x-2 overflow-hidden p-3">
                  <MemberAvatar
                    name={member.name}
                    className="size-8 md:size-10 lg:size-12"
                    fallbackClassName="text-lg"
                  />
                  <div className="flex flex-col items-center">
                    <p className="font-medium lg:text-lg">{member.name}</p>
                    <p className="text-xs text-muted-foreground lg:text-sm">
                      {member.email}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
          <li className="hidden text-center text-sm text-muted-foreground first-of-type:block">
            No members found!
          </li>
        </ul>
        <Button
          variant={resolvedTheme === "dark" ? "outline" : "muted"}
          className="mt-4 w-full"
          asChild
        >
          <Link href={`/dashboard/workspaces/${workspaceId}/projects`}>
            Show All
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default MemberList;
