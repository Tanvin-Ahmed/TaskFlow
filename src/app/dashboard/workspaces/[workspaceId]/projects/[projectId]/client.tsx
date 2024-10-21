"use client";

import PageError from "@/components/custom/shared/page-error";
import PageLoader from "@/components/custom/shared/page-loader";
import useGetProject from "@/features/projects/api/use-get-project";
import ProjectHeader from "@/features/projects/components/project-header";
import useProjectId from "@/features/projects/hooks/use-project-id";
import TaskViewSwitcher from "@/features/tasks/components/task-view-switcher";

const ProjectIdClient = () => {
  const projectId = useProjectId();
  const { data, isLoading } = useGetProject({ projectId });

  return isLoading ? (
    <PageLoader />
  ) : data ? (
    <section className="flex flex-col gap-y-4">
      <ProjectHeader initialValues={data} />
      <TaskViewSwitcher hideProjectFilter />
    </section>
  ) : (
    <PageError message="Project not found!" className="h-screen" />
  );
};

export default ProjectIdClient;
