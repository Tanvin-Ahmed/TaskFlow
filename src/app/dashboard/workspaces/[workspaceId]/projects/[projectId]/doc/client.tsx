"use client";
import { useState } from "react";

import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import { useTheme } from "next-themes";
import {
  ExcalidrawElement,
  Theme,
} from "@excalidraw/excalidraw/types/element/types";
import useProjectId from "@/features/projects/hooks/use-project-id";
import useGetProject from "@/features/projects/api/use-get-project";
import PageLoader from "@/components/custom/shared/page-loader";
import ActiveCollaborators from "@/features/live-block/components/active-collaborators";
import { Editor } from "@/components/editor/Editor";
import { Badge } from "@/components/ui/badge";
import ShareModal from "@/features/live-block/components/share-modal";
import useShareDocModal from "@/features/live-block/hooks/use-share-doc-modal";
import { Button } from "@/components/ui/button";
import { VscGitPullRequestGoToChanges } from "react-icons/vsc";
import useGetDoc from "@/features/live-block/api/use-get-doc";
import { useGetUserIsAdmin } from "@/features/workspaces/api/use-get-user-isAdmin";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";
import { Models } from "node-appwrite";
import { useGetUserIsOwner } from "@/features/workspaces/api/use-get-user-isOwner";
import { LoaderIcon, TrashIcon } from "lucide-react";
import useConfirm from "@/hooks/use-confirm";
import { useDeleteDoc } from "@/features/live-block/api/use-delete-doc";

interface Props {
  user: Models.User<Models.Preferences>;
}

const DocClient = ({ user }: Props) => {
  const projectId = useProjectId();
  const workspaceId = useWorkspaceId();

  // get data hooks
  const { data: project, isLoading: isLoadingProject } = useGetProject({
    projectId,
  });
  const { data: docInfo, isLoading: isLoadingDocInfo } = useGetDoc({
    roomId: projectId,
  });
  const { data: isAdmin, isLoading: isLoadingIsAdmin } = useGetUserIsAdmin({
    workspaceId,
    userId: user.$id,
  });
  const { data: isOwner, isLoading: isLoadingIsOwner } = useGetUserIsOwner({
    workspaceId,
    userId: user.$id,
  });

  // mutation hooks
  const { mutate: deleteDoc, isPending: isPendingDelete } = useDeleteDoc({
    workspaceId,
  });

  const { open: openShareDoc } = useShareDocModal();
  const { confirm, ConfirmationDialog } = useConfirm(
    "Delete Documentation",
    "This action cannot be undone.",
    "destructive",
  );
  const { resolvedTheme } = useTheme();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [canvas, setCanvas] = useState<readonly ExcalidrawElement[]>([]);

  if (
    isLoadingProject ||
    isLoadingDocInfo ||
    isLoadingIsAdmin ||
    isLoadingIsOwner
  ) {
    return <PageLoader />;
  }

  if (!docInfo) {
    throw new Error("Document not found");
  }

  const handleDocumentationDelete = async (roomId: string) => {
    const ok = await confirm();
    if (!ok) {
      return;
    }

    deleteDoc({
      param: { roomId },
    });
  };

  return (
    <section className="space-y-8">
      {/* modal */}
      <ShareModal
        creatorId={docInfo.room.metadata.creatorId as string}
        currentUserType={docInfo.currentUserType}
        collaborators={docInfo.collaborators}
      />
      <ConfirmationDialog />

      {/* header */}
      <div className="flex w-full items-center justify-between">
        <div className="flex items-end gap-4">
          <h1 className="truncate text-lg font-medium">
            {docInfo.room.metadata.title} Doc
          </h1>

          {docInfo.currentUserType === "viewer" ? (
            <Badge>view only</Badge>
          ) : null}
        </div>
        <div className="flex items-center justify-center gap-3">
          <ActiveCollaborators />

          {isOwner || isAdmin ? (
            // only workspace owner or workspace admin can give access permissions to other team members
            <Button onClick={openShareDoc}>
              <VscGitPullRequestGoToChanges className="size-5 sm:mr-1 sm:size-4" />{" "}
              <span className="hidden sm:block">Give Access</span>
            </Button>
          ) : null}

          {isOwner ? (
            // only workspace owner can delete project document
            <Button
              variant={"destructive"}
              size={"icon"}
              onClick={() => handleDocumentationDelete(projectId)}
              disabled={isPendingDelete}
            >
              {isPendingDelete ? (
                <LoaderIcon className="size-3 animate-spin text-muted-foreground" />
              ) : (
                <TrashIcon className="size-4" />
              )}
            </Button>
          ) : null}
        </div>
      </div>
      {/* doc */}
      <Editor currentUserType={docInfo.currentUserType} />

      {/* whiteboard/canvas */}
      <div className="h-[70vh] overflow-auto">
        <Excalidraw
          isCollaborating
          initialData={{
            elements: project?.canvas ? JSON.parse(project.canvas) : undefined,
          }}
          theme={resolvedTheme as Theme}
          onChange={(excalidrawElements) => {
            setCanvas(excalidrawElements);
          }}
          UIOptions={{
            canvasActions: {
              loadScene: false,
              toggleTheme: false,
            },
            tools: {
              image: false,
            },
          }}
        >
          <MainMenu>
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.DefaultItems.SaveAsImage />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
          </MainMenu>
          <WelcomeScreen>
            <WelcomeScreen.Hints.MenuHint />
            <WelcomeScreen.Hints.MenuHint />
            <WelcomeScreen.Hints.ToolbarHint />
            <WelcomeScreen.Center>
              <WelcomeScreen.Center.MenuItemHelp />
            </WelcomeScreen.Center>
          </WelcomeScreen>
        </Excalidraw>
      </div>
    </section>
  );
};

export default DocClient;
