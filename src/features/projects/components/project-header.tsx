"use client";
import { useRouter } from "next/navigation";
import useGetProjects from "../api/use-get-projects";
import ProjectAvatar from "./project-avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader, PencilIcon } from "lucide-react";
import { Project } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  initialValues: Project;
}

const ProjectHeader = ({ initialValues }: Props) => {
  const router = useRouter();
  const { data, isLoading } = useGetProjects({
    workspaceId: initialValues.workspaceId,
  });

  const onChange = (id: string) => {
    router.push(
      `/dashboard/workspaces/${initialValues.workspaceId}/projects/${id}`,
    );
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <Select defaultValue={initialValues.$id} onValueChange={onChange}>
        <SelectTrigger className="w-fit">
          <SelectValue defaultValue={initialValues.$id} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader className="size-4 animate-spin" />
            </div>
          ) : (
            data?.documents.map((project) => (
              <SelectItem key={project.$id} value={project.$id}>
                <div className="flex items-center gap-x-2">
                  <ProjectAvatar
                    className="size-6"
                    name={project.name}
                    image={project?.imageUrl}
                  />
                  {project.name}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      <div>
        <Button variant={"secondary"} size={"sm"} asChild>
          <Link
            href={`/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}/settings`}
          >
            <PencilIcon className="mr-2 size-3" /> Edit Project
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ProjectHeader;
