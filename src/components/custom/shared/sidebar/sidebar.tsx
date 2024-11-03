"use client";

import Link from "next/link";
import CustomAvatar from "../custom-avatar";
import DottedSeparator from "../dotted-separator";
import Navigation from "./navigation";
import WorkspaceSwitcher from "./workspace-switcher";
import Projects from "./projects";
import ProjectProgress from "./project-progress";
import { Models } from "node-appwrite";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";
import { LoaderIcon } from "lucide-react";
import { useGetUserIsOwner } from "@/features/workspaces/api/use-get-user-isOwner";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";

interface Props {
  user: Models.User<Models.Preferences>;
}

const Sidebar = ({ user }: Props) => {
  const workspaceId = useWorkspaceId();
  const { data: isOwner, isLoading: isLoadingIsOwner } = useGetUserIsOwner({
    workspaceId,
    userId: user.$id,
  });
  const { data: workspace, isLoading: isLoadingWorkspace } = useGetWorkspace({
    workspaceId,
  });

  return (
    <aside className="h-full w-full overflow-y-auto bg-neutral-100 p-4 dark:bg-indigo-900/20 dark:backdrop-blur-sm">
      <Link href={"/"} className="flex items-center gap-2">
        <CustomAvatar src="/assets/icons/logo.png" alt="TF" />
        <h1 className="text-xl font-bold sm:text-2xl">
          <span className="text-primary">Task</span> Flow
        </h1>
      </Link>
      <DottedSeparator className="my-4" />
      <WorkspaceSwitcher />
      <DottedSeparator className="my-4" />
      <Navigation />
      <DottedSeparator className="my-4" />
      {isLoadingWorkspace ? (
        <div className={"flex items-center justify-center"}>
          <LoaderIcon className="size-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Projects user={user} isOwner={!!isOwner} workspace={workspace!} />
      )}

      {isLoadingIsOwner ? (
        <div className="flex items-center justify-center">
          <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : isOwner ? (
        <>
          <DottedSeparator className="my-4" />
          <ProjectProgress user={user} />
        </>
      ) : null}
    </aside>
  );
};

export default Sidebar;
