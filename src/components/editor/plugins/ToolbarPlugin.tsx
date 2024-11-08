"use client";

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $isRootOrShadowRoot,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $findMatchingParent } from "@lexical/utils";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const LowPriority = 1;

function Divider() {
  return <div className="divider" />;
}

export default function ToolbarPlugin() {
  const { resolvedTheme } = useTheme();
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const activeBlock = useActiveBlock();

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority,
      ),
    );
  }, [editor, $updateToolbar]);

  function toggleBlock(type: "h1" | "h2" | "h3" | "quote") {
    const selection = $getSelection();

    if (activeBlock === type) {
      return $setBlocksType(selection, () => $createParagraphNode());
    }

    if (type === "h1") {
      return $setBlocksType(selection, () => $createHeadingNode("h1"));
    }

    if (type === "h2") {
      return $setBlocksType(selection, () => $createHeadingNode("h2"));
    }

    if (type === "h3") {
      return $setBlocksType(selection, () => $createHeadingNode("h3"));
    }

    if (type === "quote") {
      return $setBlocksType(selection, () => $createQuoteNode());
    }
  }

  return (
    <ScrollArea className="w-full shrink-0 whitespace-nowrap rounded-lg border">
      <div
        className={cn({
          toolbar: resolvedTheme === "light",
          "toolbar-dark": resolvedTheme === "dark",
        })}
        ref={toolbarRef}
      >
        <button
          disabled={!canUndo}
          onClick={() => {
            editor.dispatchCommand(UNDO_COMMAND, undefined);
          }}
          className="toolbar-item spaced"
          aria-label="Undo"
        >
          <i
            className={cn("undo", {
              format: resolvedTheme === "light",
              "format-dark": resolvedTheme === "dark",
            })}
          />
        </button>
        <button
          disabled={!canRedo}
          onClick={() => {
            editor.dispatchCommand(REDO_COMMAND, undefined);
          }}
          className="toolbar-item"
          aria-label="Redo"
        >
          <i
            className={cn("redo", {
              format: resolvedTheme === "light",
              "format-dark": resolvedTheme === "dark",
            })}
          />
        </button>
        <Divider />
        <button
          onClick={() => editor.update(() => toggleBlock("h1"))}
          data-active={activeBlock === "h1" ? "" : undefined}
          className={
            "toolbar-item spaced " + (activeBlock === "h1" ? "active" : "")
          }
        >
          <i
            className={cn("h1", {
              format: resolvedTheme === "light",
              "format-dark": resolvedTheme === "dark",
            })}
          />
        </button>
        <button
          onClick={() => editor.update(() => toggleBlock("h2"))}
          data-active={activeBlock === "h2" ? "" : undefined}
          className={
            "toolbar-item spaced " + (activeBlock === "h2" ? "active" : "")
          }
        >
          <i
            className={cn("h2", {
              format: resolvedTheme === "light",
              "format-dark": resolvedTheme === "dark",
            })}
          />
        </button>
        <button
          onClick={() => editor.update(() => toggleBlock("h3"))}
          data-active={activeBlock === "h3" ? "" : undefined}
          className={
            "toolbar-item spaced " + (activeBlock === "h3" ? "active" : "")
          }
        >
          <i
            className={cn("h3", {
              format: resolvedTheme === "light",
              "format-dark": resolvedTheme === "dark",
            })}
          />
        </button>
        <Divider />
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
          }}
          className={"toolbar-item spaced " + (isBold ? "active" : "")}
          aria-label="Format Bold"
        >
          <i
            className={cn("bold", {
              format: resolvedTheme === "light",
              "format-dark": resolvedTheme === "dark",
            })}
          />
        </button>
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
          }}
          className={"toolbar-item spaced " + (isItalic ? "active" : "")}
          aria-label="Format Italics"
        >
          <i
            className={cn("italic", {
              format: resolvedTheme === "light",
              "format-dark": resolvedTheme === "dark",
            })}
          />
        </button>
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
          }}
          className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
          aria-label="Format Underline"
        >
          <i
            className={cn("underline", {
              format: resolvedTheme === "light",
              "format-dark": resolvedTheme === "dark",
            })}
          />
        </button>
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
          }}
          className={"toolbar-item spaced " + (isStrikethrough ? "active" : "")}
          aria-label="Format Strikethrough"
        >
          <i
            className={cn("strikethrough", {
              format: resolvedTheme === "light",
              "format-dark": resolvedTheme === "dark",
            })}
          />
        </button>
        <Divider />
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
          }}
          className="toolbar-item spaced"
          aria-label="Left Align"
        >
          <i
            className={cn("left-align", {
              format: resolvedTheme === "light",
              "format-dark": resolvedTheme === "dark",
            })}
          />
        </button>
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
          }}
          className="toolbar-item spaced"
          aria-label="Center Align"
        >
          <i
            className={cn("center-align", {
              format: resolvedTheme === "light",
              "format-dark": resolvedTheme === "dark",
            })}
          />
        </button>
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
          }}
          className="toolbar-item spaced"
          aria-label="Right Align"
        >
          <i
            className={cn("right-align", {
              format: resolvedTheme === "light",
              "format-dark": resolvedTheme === "dark",
            })}
          />
        </button>
        <button
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
          }}
          className="toolbar-item"
          aria-label="Justify Align"
        >
          <i
            className={cn("justify-align", {
              format: resolvedTheme === "light",
              "format-dark": resolvedTheme === "dark",
            })}
          />
        </button>{" "}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

function useActiveBlock() {
  const [editor] = useLexicalComposerContext();

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return editor.registerUpdateListener(onStoreChange);
    },
    [editor],
  );

  const getSnapshot = useCallback(() => {
    return editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return null;

      const anchor = selection.anchor.getNode();
      let element =
        anchor.getKey() === "root"
          ? anchor
          : $findMatchingParent(anchor, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchor.getTopLevelElementOrThrow();
      }

      if ($isHeadingNode(element)) {
        return element.getTag();
      }

      return element.getType();
    });
  }, [editor]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
