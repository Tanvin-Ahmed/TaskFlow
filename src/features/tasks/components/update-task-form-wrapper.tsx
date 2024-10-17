"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useGetMembers } from "@/features/members/api/use-get-members";
import useGetProjects from "@/features/projects/api/use-get-projects";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import useGetTask from "../api/use-get-task";
import UpdateTaskForm from "./update-task-form";

interface Props {
  onCancel: () => void;
  id: string;
}

const UpdateTaskFormWrapper = ({ onCancel, id }: Props) => {
  const workspaceId = useWorkspaceId();
  const { data: projects, isLoading: isProjectsLoading } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: isMembersLoading } = useGetMembers({
    workspaceId,
  });
  const { data: initialValues, isLoading: isLoadingTask } = useGetTask({
    taskId: id,
  });

  const [memberOptions, setMemberOptions] = useState<
    { $id: string; name: string }[] | []
  >([]);
  const [projectOptions, setProjectOptions] = useState<
    { $id: string; name: string; imageUrl: string }[] | []
  >([]);

  useEffect(() => {
    if (!members?.total) return;

    const memberOptions = members?.documents.map((project) => ({
      $id: project.$id,
      name: project.name,
    }));
    setMemberOptions(memberOptions ?? []);
  }, [members]);

  useEffect(() => {
    if (!projects?.total) return;

    const projectOptions = projects?.documents.map((project) => ({
      $id: project.$id,
      name: project.name as string,
      imageUrl: project.imageUrl as string,
    }));
    setProjectOptions(projectOptions ?? []);
  }, [projects]);

  const isLoading = isProjectsLoading || isMembersLoading || isLoadingTask;

  return isLoading ? (
    <Card className={"h-[714px] w-full border border-none shadow-none"}>
      <CardContent className={"flex h-full items-center justify-center"}>
        <Loader className={"size-5 animate-spin text-muted-foreground"} />
      </CardContent>
    </Card>
  ) : initialValues ? (
    <UpdateTaskForm
      initialValues={initialValues}
      onCancel={onCancel}
      projectOptions={projectOptions}
      memberOptions={memberOptions}
    />
  ) : null;
};

export default UpdateTaskFormWrapper;
