"use client";

import Analytics from "@/components/custom/analytics/analytics";
import PageError from "@/components/custom/shared/page-error";
import PageLoader from "@/components/custom/shared/page-loader";
import useGetProject from "@/features/projects/api/use-get-project";
import useGetProjectAnalytics from "@/features/projects/api/use-get-project-analytics";
import ProjectHeader from "@/features/projects/components/project-header";
import useProjectId from "@/features/projects/hooks/use-project-id";
import TaskViewSwitcher from "@/features/tasks/components/task-view-switcher";

const ProjectIdClient = () => {
  const projectId = useProjectId();
  const { data: project, isLoading: projectLoading } = useGetProject({
    projectId,
  });
  const { data: analytics, isLoading: analyticsLoading } =
    useGetProjectAnalytics({ projectId });

  const isLoading = projectLoading || analyticsLoading;
  const error = !project;

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return <PageError message="Project not found!" className="h-screen" />;
  }

  return (
    <section className="flex flex-col gap-y-4">
      <ProjectHeader initialValues={project} />
      {analytics ? <Analytics data={analytics} /> : null}
      <TaskViewSwitcher hideProjectFilter />
    </section>
  );
};

export default ProjectIdClient;
