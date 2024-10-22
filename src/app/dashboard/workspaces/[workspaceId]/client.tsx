"use client";
import Analytics from "@/components/custom/analytics/analytics";
import PageError from "@/components/custom/shared/page-error";
import PageLoader from "@/components/custom/shared/page-loader";
import { useGetMembers } from "@/features/members/api/use-get-members";
import useGetProjects from "@/features/projects/api/use-get-projects";
import useCreateProjectModal from "@/features/projects/hooks/use-create-project-modal";
import useGetTasks from "@/features/tasks/api/use-get-tasks";
import useGetWorkspaceAnalytics from "@/features/workspaces/api/use-get-workspace-analytics";
import TaskList from "@/features/workspaces/components/task-list";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";

const WorkspaceIdClient = () => {
  const workspaceId = useWorkspaceId();
  const { data: analytics, isLoading: isLoadingAnalytics } =
    useGetWorkspaceAnalytics({ workspaceId });
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
  });
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });

  const { open: createProject } = useCreateProjectModal();

  const isLoading =
    isLoadingAnalytics ||
    isLoadingTasks ||
    isLoadingProjects ||
    isLoadingMembers;

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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TaskList data={tasks.documents} total={tasks.total} />
      </div>
    </div>
  );
};

export default WorkspaceIdClient;
