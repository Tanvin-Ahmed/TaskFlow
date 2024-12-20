"use client";
import Analytics from "@/components/custom/analytics/analytics";
import PageError from "@/components/custom/shared/page-error";
import PageLoader from "@/components/custom/shared/page-loader";
import { useGetMembers } from "@/features/members/api/use-get-members";
import useGetProjects from "@/features/projects/api/use-get-projects";
import useGetTasks from "@/features/tasks/api/use-get-tasks";
import { useGetUserIsOwner } from "@/features/workspaces/api/use-get-user-isOwner";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import useGetWorkspaceAnalytics from "@/features/workspaces/api/use-get-workspace-analytics";
import MeetingButton from "@/features/workspaces/components/meeting-button";
import MemberList from "@/features/workspaces/components/member-list";
import ProjectList from "@/features/workspaces/components/project-list";
import TaskList from "@/features/workspaces/components/task-list";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";
import { LoaderIcon } from "lucide-react";
import { Models } from "node-appwrite";

interface Props {
  user: Models.User<Models.Preferences>;
}

const WorkspaceIdClient = ({ user }: Props) => {
  const workspaceId = useWorkspaceId();
  const { data: workspace, isLoading: isLoadingWorkspace } = useGetWorkspace({
    workspaceId,
  });
  const { data: analytics, isLoading: isLoadingAnalytics } =
    useGetWorkspaceAnalytics({ workspaceId });
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    limit: 3,
  });
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
    limit: 3,
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
    limit: 3,
  });
  const { data: isOwner, isLoading: isLoadingIsOwner } = useGetUserIsOwner({
    workspaceId,
    userId: user.$id,
  });

  const isLoading =
    isLoadingAnalytics ||
    isLoadingTasks ||
    isLoadingProjects ||
    isLoadingMembers ||
    isLoadingIsOwner;

  const isError = !analytics || !tasks || !projects || !members;

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError) {
    return <PageError message={"Fail to load workspace data"} />;
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <Analytics data={analytics} />
      {isLoadingWorkspace ? (
        <div className="flex items-center justify-end">
          <LoaderIcon className="size-4 animate-spin text-muted-foreground" />
        </div>
      ) : workspace ? (
        <MeetingButton user={user} workspace={workspace} />
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TaskList data={tasks.documents} total={tasks.total} user={user} />
        {workspace ? (
          <ProjectList
            data={projects.documents}
            total={projects.total}
            user={user}
            isOwner={!!isOwner}
            workspace={workspace}
          />
        ) : null}
        <MemberList
          data={members.documents}
          total={members.total}
          user={user}
        />
      </div>
    </div>
  );
};

export default WorkspaceIdClient;
