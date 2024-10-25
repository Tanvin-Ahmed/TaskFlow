"use client";
/* eslint-disable @typescript-eslint/ban-ts-comment */

import EditorJS, { OutputData } from "@editorjs/editorjs";
import { useEffect, useRef, useState } from "react";
import Header from "@editorjs/header";
// @ts-expect-error
import Checklist from "@editorjs/checklist";
// @ts-expect-error
import Warning from "@editorjs/warning";
import Quote from "@editorjs/quote";
// @ts-expect-error
import Embed from "@editorjs/embed";
// @ts-expect-error
import SimpleImage from "@editorjs/simple-image";
// @ts-expect-error
import RawTool from "@editorjs/raw";
import NestedList from "@editorjs/nested-list";
import Underline from "@editorjs/underline";
import Table from "@editorjs/table";
import CodeTool from "@editorjs/code";
// @ts-expect-error
import Tooltip from "editorjs-tooltip";
// @ts-expect-error
import Undo from "editorjs-undo";
// @ts-expect-error
import DragDrop from "editorjs-drag-drop";
import { Button } from "@/components/ui/button";
import { UploadCloudIcon } from "lucide-react";

import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import { useTheme } from "next-themes";
import { Theme } from "@excalidraw/excalidraw/types/element/types";

const DocClient = () => {
  const { resolvedTheme } = useTheme();
  const ref = useRef<EditorJS>();

  // page load complete tracking
  const [isRenderComplete, setRenderComplete] = useState(false);
  useEffect(() => {
    setRenderComplete(true);
  }, []);

  useEffect(() => {
    const initEditor = () => {
      const editor = new EditorJS({
        onReady: () => {
          new Undo({ editor });
          new DragDrop(editor);
        },
        holder: "editorjs",
        placeholder: "Write documentation here...",
        tools: {
          header: {
            // @ts-expect-error
            class: Header,
          },
          list: NestedList,
          checklist: {
            class: Checklist,
            inlineToolbar: true,
          },
          warning: Warning,
          quote: Quote,
          embed: {
            class: Embed,
            config: {
              services: {
                youtube: true,
                coub: true,
              },
            },
          },
          image: SimpleImage,
          raw: RawTool,
          underline: Underline,
          table: Table,
          code: CodeTool,
          tooltip: {
            class: Tooltip,
            config: {
              location: "left",
              underline: true,
              placeholder: "Enter a tooltip",
              highlightColor: "#FFEFD5",
              backgroundColor: "#154360",
              textColor: "#FDFEFE",
              holder: "editorId",
            },
          },
        },
      });

      ref.current = editor;
    };

    if (isRenderComplete) initEditor();
  }, [isRenderComplete]);

  const onSave = async () => {
    let docInfo: OutputData;

    if (ref.current) {
      docInfo = (await ref.current.save()) as OutputData;
    }

    console.log(docInfo);
  };

  return (
    <section className="space-y-8">
      {/* header */}
      <div className="flex w-full items-center justify-between">
        <h1 className="truncate text-lg font-medium">Documentation</h1>
        <Button size={"sm"} onClick={onSave}>
          <UploadCloudIcon className="mr-1.5 size-3" /> Save
        </Button>
      </div>

      {/* main layout */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {/* doc */}
        <div className="h-[70vh] overflow-auto">
          <div id="editorjs" className="h-full" />
        </div>

        {/* whiteboard/canvas */}
        <div className="h-[70vh] overflow-auto">
          <Excalidraw
            theme={resolvedTheme as Theme}
            onChange={(excalidrawElements, appState, files) => {
              console.log(excalidrawElements);
            }}
            UIOptions={{
              canvasActions: {
                loadScene: false,
                toggleTheme: false,
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
      </div>
    </section>
  );
};

export default DocClient;
