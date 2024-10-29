"use client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DEFAULT_VALUES } from "@/constant/values";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetSubscription } from "@/features/pricing/api/use-get-subscription";
import useGetProjects from "@/features/projects/api/use-get-projects";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";
import { Loader, Sparkles } from "lucide-react";
import Link from "next/link";
import { Models } from "node-appwrite";

interface Props {
  user: Models.User<Models.Preferences>;
}

const ProjectProgress = ({ user }: Props) => {
  const workspaceId = useWorkspaceId();
  const { data, isLoading } = useGetProjects({ workspaceId });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });
  const { data: subscription, isLoading: isLoadingSubscription } =
    useGetSubscription({ userId: user.$id });

  return isLoadingSubscription ? (
    <Loader className="size-4 animate-spin text-muted-foreground" />
  ) : subscription && subscription?.isSubscribed ? (
    <small className="flex items-center gap-2 text-purple-500">
      <Sparkles className="size-4 text-purple-500" />{" "}
      <span>
        You are in <strong>Pro</strong> plan
      </span>
    </small>
  ) : (
    <>
      <div className="flex flex-col gap-y-4">
        <p className="text-xs uppercase text-neutral-500 dark:text-neutral-50">
          Projects Limitation
        </p>
        <div>
          {isLoading ? (
            <Loader className="size-4 animate-spin" />
          ) : data ? (
            <>
              <Progress
                value={
                  (100 /
                    DEFAULT_VALUES.FREE_VERSION_PROJECT_COUNT_PER_WORKSPACE) *
                  data.total
                }
                className="w-full"
              />
            </>
          ) : null}
          <small className="text-xs text-muted-foreground">
            <span className="font-semibold">{data?.total}</span> out of{" "}
            <span className="font-semibold">
              {DEFAULT_VALUES.FREE_VERSION_PROJECT_COUNT_PER_WORKSPACE}
            </span>{" "}
            projects used
          </small>
        </div>

        <p className="text-xs uppercase text-neutral-500 dark:text-neutral-50">
          Members Limitation
        </p>
        <div>
          {isLoadingMembers ? (
            <Loader className="size-4 animate-spin" />
          ) : members ? (
            <>
              <Progress
                value={
                  (100 /
                    DEFAULT_VALUES.FREE_VERSION_MEMBER_COUNT_PER_WORKSPACE) *
                  members.total
                }
                className="w-full"
              />
            </>
          ) : null}
          <small className="text-xs text-muted-foreground">
            <span className="font-semibold">{members?.total}</span> out of{" "}
            <span className="font-semibold">
              {DEFAULT_VALUES.FREE_VERSION_MEMBER_COUNT_PER_WORKSPACE}
            </span>{" "}
            members
          </small>
        </div>

        <div>
          <Button className="w-full" size={"sm"} asChild>
            <Link href={"/pricing"} className="w-full">
              <Sparkles className="mr-1 size-3.5" />
              Upgrade
            </Link>
          </Button>
          <small className="text-xs text-muted-foreground">
            Upgrade your plan for unlimited access
          </small>
        </div>
      </div>
    </>
  );
};

export default ProjectProgress;
