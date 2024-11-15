"use client";
import { useRouter } from "next/navigation";
import useGetProjects from "../api/use-get-projects";
import ProjectAvatar from "./project-avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileIcon, Loader, MoreVerticalIcon, PencilIcon } from "lucide-react";
import { Project } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";
import { createDocument } from "@/features/live-block/server/actions";
import { Models } from "node-appwrite";
import { useUpdateProject } from "../api/use-update-project";
import useProjectId from "../hooks/use-project-id";
import { useState } from "react";
import { getIsOwner } from "@/features/auth/server/queries";
import useGetProject from "../api/use-get-project";

interface Props {
  initialValues: Project;
  user: Models.User<Models.Preferences>;
}

const ProjectHeader = ({ initialValues, user }: Props) => {
  const router = useRouter();
  const projectId = useProjectId();
  const { data, isLoading } = useGetProjects({
    workspaceId: initialValues.workspaceId,
  });
  const { data: project, isLoading: isLoadingProject } = useGetProject({
    projectId,
  });
  const { mutate, isPending } = useUpdateProject();

  const [isLoadingCreateRoom, setIsLoadingCreateRoom] = useState(false);

  const onChange = (id: string) => {
    router.push(
      `/dashboard/workspaces/${initialValues.workspaceId}/projects/${id}`,
    );
  };

  const documentHandler = async () => {
    try {
      setIsLoadingCreateRoom(true);

      const isOwner = await getIsOwner(user.$id, initialValues.workspaceId);
      const isPermitted = project?.docPermissionMemberList
        ? (JSON.parse(project.docPermissionMemberList) as string[]).includes(
            user.email,
          )
        : false;

      if (!isOwner && !isPermitted) {
        throw new Error("Not permitted to access the project documentation.");
      }

      if (initialValues?.isDocCreated) {
        router.push(
          `/dashboard/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}/doc`,
        );
        return;
      }

      if (!isOwner) {
        throw new Error(
          "Only workspace owner can create the project documentation.",
        );
      }

      const room = await createDocument({
        userId: user.$id,
        email: user.email,
        projectId: initialValues.$id,
        projectName: initialValues.name,
      });

      if (room) {
        mutate({
          param: { projectId },
          form: {
            isDocCreated: "true",
            docPermissionMemberList: JSON.stringify([user.email]),
          },
        });

        router.push(
          `/dashboard/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}/doc`,
        );
      }
    } catch (error) {
      toast.error(
        (error as Error).message || "Something went wrong. Please try again",
      );
    } finally {
      setIsLoadingCreateRoom(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <Select defaultValue={initialValues.$id} onValueChange={onChange}>
        <SelectTrigger className="w-fit">
          <SelectValue defaultValue={initialValues.$id} />
        </SelectTrigger>
        <SelectContent>
          {isLoading || isLoadingProject ? (
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"secondary"} size={"icon"}>
              <MoreVerticalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Button
                variant={"ghost"}
                size={"sm"}
                asChild
                className="flex w-full justify-start"
              >
                <Link
                  href={`/workspaces/${initialValues.workspaceId}/projects/${initialValues.$id}/settings`}
                >
                  <PencilIcon className="mr-2 size-3" /> Edit Project
                </Link>
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Button
                variant={"ghost"}
                size={"sm"}
                onClick={documentHandler}
                className="flex w-full justify-start"
                disabled={isPending || isLoadingCreateRoom}
              >
                {isPending || isLoadingCreateRoom ? (
                  <>
                    <Loader className="mr-2 size-3 animate-spin text-muted-foreground" />{" "}
                    Creating doc
                  </>
                ) : (
                  <>
                    <FileIcon className="mr-2 size-3" /> Write doc
                  </>
                )}
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ProjectHeader;
