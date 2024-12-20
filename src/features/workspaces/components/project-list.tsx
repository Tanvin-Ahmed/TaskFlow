"use client";
import DottedSeparator from "@/components/custom/shared/dotted-separator";
import { Button } from "@/components/ui/button";
import { Loader, PlusIcon } from "lucide-react";
import Link from "next/link";
import useWorkspaceId from "../hooks/use-workspace-id";
import { Card, CardContent } from "@/components/ui/card";
import useCreateProjectModal from "@/features/projects/hooks/use-create-project-modal";
import { Project } from "@/features/projects/types";
import ProjectAvatar from "@/features/projects/components/project-avatar";
import { useTheme } from "next-themes";
import { DEFAULT_VALUES } from "@/constant/values";
import { Models } from "node-appwrite";
import { useGetSubscription } from "@/features/pricing/api/use-get-subscription";
import { useGetUserIsAdmin } from "../api/use-get-user-isAdmin";
import { Workspace } from "../types";

interface Props {
  data: Project[];
  total: number;
  user: Models.User<Models.Preferences>;
  isOwner: boolean;
  workspace: Workspace;
}

const ProjectList = ({ data, total, user, isOwner, workspace }: Props) => {
  const { resolvedTheme } = useTheme();

  const workspaceId = useWorkspaceId();
  const { open: createProject } = useCreateProjectModal();
  const { data: isAdmin, isLoading: isLoadingIsAdmin } = useGetUserIsAdmin({
    workspaceId,
    userId: user.$id,
  });
  const { data: subscription, isLoading: isLoadingSubscription } =
    useGetSubscription({ userId: isOwner ? user.$id : workspace.userId });

  const isLoading = isLoadingSubscription || isLoadingIsAdmin;
  const buttonDisabled =
    isLoading ||
    (subscription && subscription.isSubscribed
      ? false
      : data
        ? total >= DEFAULT_VALUES.FREE_VERSION_PROJECT_COUNT_PER_WORKSPACE
        : false) ||
    !isAdmin;

  return (
    <div className="col-span-1 flex flex-col gap-y-4">
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Projects {total}</p>
          <Button
            variant={resolvedTheme === "dark" ? "outline" : "muted"}
            size={"icon"}
            onClick={createProject}
            disabled={buttonDisabled}
          >
            {isLoading ? (
              <Loader className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <PlusIcon className="size-4 text-neutral-400" />
            )}
          </Button>
        </div>
        <DottedSeparator className="my-4" />

        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.map((project) => (
            <li key={project.$id}>
              <Link
                href={`/dashboard/workspaces/${workspaceId}/projects/${project.$id}`}
              >
                <Card className="rounded-lg shadow-none transition hover:opacity-75">
                  <CardContent className="flex items-center gap-x-2.5 p-4">
                    <ProjectAvatar
                      name={project.name}
                      image={project?.imageUrl}
                      className="size-8 md:size-10 lg:size-12"
                      fallbackClassName="text-lg"
                    />
                    <p className="truncate text-lg font-medium">
                      {project.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          <li className="hidden text-center text-sm text-muted-foreground first-of-type:block">
            No projects found!
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

export default ProjectList;
