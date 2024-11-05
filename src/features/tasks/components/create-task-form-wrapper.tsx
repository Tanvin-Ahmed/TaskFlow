"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useGetMembers } from "@/features/members/api/use-get-members";
import useGetProjects from "@/features/projects/api/use-get-projects";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import CreateTaskForm from "./create-task-form";
import { useEffect, useState } from "react";
import { TaskStatus } from "../types";

interface Props {
  onCancel: () => void;
  status?: TaskStatus;
}

const CreateTaskFormWrapper = ({ onCancel, status }: Props) => {
  const workspaceId = useWorkspaceId();
  const { data: projects, isLoading: isProjectsLoading } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: isMembersLoading } = useGetMembers({
    workspaceId,
  });

  const [memberOptions, setMemberOptions] = useState<
    { userId: string; name: string }[] | []
  >([]);
  const [projectOptions, setProjectOptions] = useState<
    { $id: string; name: string; imageUrl: string }[] | []
  >([]);

  useEffect(() => {
    if (!members?.total) return;

    const memberOptions = members?.documents.map((member) => ({
      userId: member.userId,
      name: member.name,
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

  const isLoading = isProjectsLoading || isMembersLoading;

  return isLoading ? (
    <Card className={"h-[714px] w-full border border-none shadow-none"}>
      <CardContent className={"flex h-full items-center justify-center"}>
        <Loader className={"size-5 animate-spin text-muted-foreground"} />
      </CardContent>
    </Card>
  ) : (
    <CreateTaskForm
      onCancel={onCancel}
      projectOptions={projectOptions}
      memberOptions={memberOptions}
      status={status}
    />
  );
};

export default CreateTaskFormWrapper;
