"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetMembers } from "@/features/members/api/use-get-members";
import useGetProjects from "@/features/projects/api/use-get-projects";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";
import { FolderIcon, ListChecksIcon, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { TaskStatus } from "../types";
import useTaskFilters from "../hooks/use-task-filters";
import MemberAvatar from "@/features/members/components/member-avatar";
import ProjectAvatar from "@/features/projects/components/project-avatar";
import DatePicker from "@/components/custom/shared/date-picker";
import { cn } from "@/lib/utils";

interface Props {
  hideProjectFilters?: boolean;
}

const DataFilters = ({ hideProjectFilters }: Props) => {
  const workspaceId = useWorkspaceId();
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });
  const [{ status, assigneeId, projectId, dueDate }, setFilters] =
    useTaskFilters();

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

  const isLoading = isLoadingProjects || isLoadingMembers;

  const onStatusChange = (value: TaskStatus | "all") => {
    if (value === "all") {
      setFilters({ status: null });
    } else {
      setFilters({
        status: value,
      });
    }
  };

  const onAssigneeChange = (value: string) => {
    if (value === "all") {
      setFilters({ assigneeId: null });
    } else {
      setFilters({
        assigneeId: value,
      });
    }
  };

  const onProjectChange = (value: string) => {
    if (value === "all") {
      setFilters({ projectId: null });
    } else {
      setFilters({
        projectId: value,
      });
    }
  };

  return isLoading ? (
    <></>
  ) : (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Select defaultValue={status ?? undefined} onValueChange={onStatusChange}>
        <SelectTrigger className={"h-8 w-full sm:w-auto"}>
          <div className="flex items-center pr-2">
            <ListChecksIcon className="mr-2 size-4" />
            <SelectValue placeholder={"All statuses"} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectSeparator />
          <SelectItem value={TaskStatus.TODO}>Todo</SelectItem>
          <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
          <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
          <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
          <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
        </SelectContent>
      </Select>

      {/* assignee select */}
      <Select
        defaultValue={assigneeId ?? undefined}
        onValueChange={onAssigneeChange}
      >
        <SelectTrigger className={"h-8 w-full sm:w-auto"}>
          <div className="flex items-center pr-2">
            <UserIcon className="mr-2 size-4" />
            <SelectValue placeholder={"All assignees"} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All assignees</SelectItem>
          <SelectSeparator />
          {memberOptions.map((member) => (
            <SelectItem key={member.$id} value={member.$id}>
              <div className="flex items-center gap-x-2">
                <MemberAvatar className="size-6" name={member.name} />
                {member.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* project select */}
      <Select
        defaultValue={projectId ?? undefined}
        onValueChange={onProjectChange}
      >
        <SelectTrigger
          className={cn("h-8 w-full sm:w-auto", {
            hidden: hideProjectFilters,
          })}
        >
          <div className="flex items-center pr-2">
            <FolderIcon className="mr-2 size-4" />
            <SelectValue placeholder={"All projects"} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All projects</SelectItem>
          <SelectSeparator />
          {projectOptions.map((project) => (
            <SelectItem key={project.$id} value={project.$id}>
              <div className="flex items-center gap-x-2">
                <ProjectAvatar
                  className="size-6"
                  name={project.name}
                  image={project.imageUrl}
                />
                {project.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DatePicker
        placeholder="Due date"
        className="h-8 w-full text-black sm:w-auto"
        value={dueDate ? new Date(dueDate) : undefined}
        onChange={(date) => {
          setFilters({ dueDate: date ? date.toISOString() : null });
        }}
      />
    </div>
  );
};

export default DataFilters;
