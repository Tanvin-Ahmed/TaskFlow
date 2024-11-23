"use client";

import Analytics from "@/components/custom/analytics/analytics";
import PageError from "@/components/custom/shared/page-error";
import PageLoader from "@/components/custom/shared/page-loader";
import useGetProject from "@/features/projects/api/use-get-project";
import useGetProjectAnalytics from "@/features/projects/api/use-get-project-analytics";
import ProjectHeader from "@/features/projects/components/project-header";
import useProjectId from "@/features/projects/hooks/use-project-id";
import TaskViewSwitcher from "@/features/tasks/components/task-view-switcher";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";
import { Models } from "node-appwrite";

interface Props {
  user: Models.User<Models.Preferences>;
}

const ProjectIdClient = ({ user }: Props) => {
  const projectId = useProjectId();
  const workspaceId = useWorkspaceId();
  const { data: project, isLoading: projectLoading } = useGetProject({
    projectId,
  });
  const { data: workspace, isLoading: isLoadingWorkspace } = useGetWorkspace({
    workspaceId,
  });
  const { data: analytics, isLoading: analyticsLoading } =
    useGetProjectAnalytics({ projectId });

  const isLoading = projectLoading || analyticsLoading || isLoadingWorkspace;
  const error = !project;

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return <PageError message="Project not found!" className="h-screen" />;
  }

  return (
    <section className="flex flex-col gap-y-4">
      {workspace ? (
        <ProjectHeader
          initialValues={project}
          user={user}
          workspace={workspace}
        />
      ) : null}
      {analytics ? <Analytics data={analytics} /> : null}
      <TaskViewSwitcher hideProjectFilter user={user} />
    </section>
  );
};

export default ProjectIdClient;
