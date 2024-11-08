"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoaderIcon, UploadCloudIcon } from "lucide-react";

import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import { useTheme } from "next-themes";
import {
  ExcalidrawElement,
  Theme,
} from "@excalidraw/excalidraw/types/element/types";
import { useUpdateProject } from "@/features/projects/api/use-update-project";
import useProjectId from "@/features/projects/hooks/use-project-id";
import useGetProject from "@/features/projects/api/use-get-project";
import PageLoader from "@/components/custom/shared/page-loader";
import ActiveCollaborators from "@/features/live-block/components/active-collaborators";
import { RoomMetadata } from "@/features/live-block/types";
import { Editor } from "@/components/editor/Editor";
import { Badge } from "@/components/ui/badge";

interface Props {
  metadata: RoomMetadata;
  users: ({
    userType: string;
    id: string;
    name: string;
    email: string;
    color: string;
  } | null)[];
  currentUserType: "editor" | "viewer";
}

const DocClient = ({ metadata, currentUserType }: Props) => {
  const projectId = useProjectId();
  const { mutate, isPending } = useUpdateProject();
  const { data: project, isLoading: isLoadingProject } = useGetProject({
    projectId,
  });

  const { resolvedTheme } = useTheme();

  const [canvas, setCanvas] = useState<readonly ExcalidrawElement[]>([]);
  // const [editing, setEditing] = useState(false);
  // const [loading, setLoading] = useState(false);
  // // page load complete tracking
  // const [isRenderComplete, setRenderComplete] = useState(false);
  // useEffect(() => {
  //   setRenderComplete(true);
  // }, []);

  const onSave = async () => {
    mutate({
      form: {
        canvas: canvas ? JSON.stringify(canvas) : undefined,
        docs: "",
      },
      param: { projectId },
    });
  };

  if (isLoadingProject) {
    return <PageLoader />;
  }

  return (
    <section className="space-y-8">
      {/* header */}
      <div className="flex w-full items-center justify-between">
        <div className="flex items-end gap-4">
          <h1 className="truncate text-lg font-medium">{metadata.title} Doc</h1>

          {currentUserType === "viewer" ? <Badge>view only</Badge> : null}
        </div>
        <div className="flex items-center justify-center gap-3">
          <ActiveCollaborators />
          <Button size={"sm"} onClick={onSave} disabled={isPending}>
            {isPending ? (
              <>
                <LoaderIcon className="mr-1.5 size-3 animate-spin text-white" />{" "}
                Saving...
              </>
            ) : (
              <>
                <UploadCloudIcon className="mr-1.5 size-3" /> Save
              </>
            )}
          </Button>
        </div>
      </div>
      {/* doc */}
      <Editor currentUserType={currentUserType} />

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
