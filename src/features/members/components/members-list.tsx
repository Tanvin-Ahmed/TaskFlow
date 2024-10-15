"use client";
import DottedSeparator from "@/components/custom/shared/dotted-separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon, Loader } from "lucide-react";
import Link from "next/link";
import { useGetMembers } from "../api/use-get-members";
import MemberTable from "./member-table";

interface Props {
  workspaceId: string;
}

const MembersList = ({ workspaceId }: Props) => {
  const { data, isLoading } = useGetMembers({ workspaceId });

  return (
    <Card className="h-full w-full border-none shadow-none">
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
          <MemberTable data={data.documents} />
        ) : null}
      </CardContent>
    </Card>
  );
};

export default MembersList;
