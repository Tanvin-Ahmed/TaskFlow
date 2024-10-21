"use client";

import PageError from "@/components/custom/shared/page-error";
import PageLoader from "@/components/custom/shared/page-loader";
import useGetProject from "@/features/projects/api/use-get-project";
import UpdateProjectForm from "@/features/projects/components/update-project-form";
import useProjectId from "@/features/projects/hooks/use-project-id";

const ProjectSettingsClient = () => {
  const projectId = useProjectId();
  const { data, isLoading } = useGetProject({ projectId });

  return isLoading ? (
    <PageLoader />
  ) : data ? (
    <section className="w-full md:max-w-xl">
      <UpdateProjectForm initialValue={data} />
    </section>
  ) : (
    <PageError message="Project not found!" className="h-screen" />
  );
};

export default ProjectSettingsClient;
