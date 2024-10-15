"use client";

import DottedSeparator from "@/components/custom/shared/dotted-separator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useJoinWorkspace } from "../api/use-join-workspace";
import { Loader } from "lucide-react";
import useInviteCode from "../hooks/use-nivite-code";
import useWorkspaceId from "../hooks/use-workspace-id";
import { useRouter } from "next/navigation";

interface Props {
  initialValue: {
    name: string;
  };
}

const JoinWorkspaceForm = ({ initialValue }: Props) => {
  const { name } = initialValue;
  const router = useRouter();
  const inviteCode = useInviteCode();
  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useJoinWorkspace();

  const onSubmit = () => {
    mutate(
      {
        param: { workspaceId },
        json: { code: inviteCode },
      },
      {
        onSuccess: ({ data }) => {
          router.push(`/dashboard/workspaces/${data.$id}`);
        },
      },
    );
  };

  return (
    <Card className="h-full w-full border-none bg-neutral-50 shadow-none dark:bg-purple-900/10">
      <CardHeader className="p-7">
        <CardTitle className="text-xl font-bold">Join workspace</CardTitle>
        <CardDescription>
          You&apos;ve been invited to join <strong>{name}</strong> workspace
        </CardDescription>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Button
            asChild
            type="button"
            className="w-full sm:w-fit"
            variant={"secondary"}
            size={"lg"}
            disabled={isPending}
          >
            <Link href={"/dashboard"}>Cancel</Link>
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-fit"
            size={"lg"}
            disabled={isPending}
            onClick={onSubmit}
          >
            {isPending ? (
              <Loader className="size-7 animate-spin" />
            ) : (
              "Join Workspace"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JoinWorkspaceForm;
