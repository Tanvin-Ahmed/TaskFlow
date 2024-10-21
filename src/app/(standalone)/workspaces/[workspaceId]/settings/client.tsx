"use client";
import PageError from "@/components/custom/shared/page-error";
import PageLoader from "@/components/custom/shared/page-loader";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import UpdateWorkspaceForm from "@/features/workspaces/components/update-workspace-form";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";

const WorkspaceSettingsClient = () => {
  const workspaceId = useWorkspaceId();
  const { data, isLoading } = useGetWorkspace({ workspaceId });

  return isLoading ? (
    <PageLoader />
  ) : data ? (
    <section className="flex flex-col gap-y-4">
      <UpdateWorkspaceForm initialValue={data} />
    </section>
  ) : (
    <PageError message="Project not found!" className="h-screen" />
  );
};

export default WorkspaceSettingsClient;
