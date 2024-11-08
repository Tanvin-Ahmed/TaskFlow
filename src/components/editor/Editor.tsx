"use client";

import Theme from "./plugins/Theme";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { HeadingNode } from "@lexical/rich-text";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import {
  FloatingComposer,
  FloatingThreads,
  liveblocksConfig,
  LiveblocksPlugin,
  useEditorStatus,
} from "@liveblocks/react-lexical";
import { LoaderIcon } from "lucide-react";
import FloatingToolbar from "./plugins/floating-toolbar";
import { useThreads } from "@liveblocks/react/suspense";
import Comments from "@/features/live-block/components/comments";

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.

function Placeholder() {
  return <div className="editor-placeholder">Write documentation here...</div>;
}

interface Props {
  currentUserType: "editor" | "viewer";
}

export function Editor({ currentUserType }: Props) {
  const { resolvedTheme } = useTheme();
  const status = useEditorStatus();
  const { threads } = useThreads();

  const initialConfig = liveblocksConfig({
    namespace: "Editor",
    nodes: [HeadingNode],
    onError: (error: Error) => {
      console.error(error);
      throw error;
    },
    theme: Theme,
    editable: currentUserType === "editor" ? true : false,
  });

  // Dynamically import the theme CSS file based on the selected theme
  useEffect(() => {
    const importTheme = async () => {
      if (resolvedTheme === "dark") {
        await import("@/styles/dark-theme.css");
      } else {
        await import("@/styles/light-theme.css");
      }
    };
    importTheme();
  }, [resolvedTheme]);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container size-full">
        <ToolbarPlugin />

        <div className="editor-wrapper flex flex-col items-center justify-start">
          {status === "not-loaded" || status === "loading" ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <LoaderIcon className="size-4 animate-spin text-muted-foreground" />
              <small className="block text-[12px] text-muted-foreground">
                Loading editor...
              </small>
            </div>
          ) : (
            <div className="editor-inner relative mb-5 h-fit min-h-[1100px] w-full max-w-[800px] shadow-md lg:mb-10">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="editor-input h-full text-black dark:text-white" />
                }
                placeholder={<Placeholder />}
                ErrorBoundary={LexicalErrorBoundary}
              />
              {currentUserType === "editor" ? <FloatingToolbar /> : null}
              <HistoryPlugin />
              <AutoFocusPlugin />
            </div>
          )}

          <LiveblocksPlugin>
            <FloatingComposer className="w-[350px]" />
            <FloatingThreads threads={threads} />
            <Comments />
          </LiveblocksPlugin>
        </div>
      </div>
    </LexicalComposer>
  );
}
