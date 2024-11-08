"use client";

import { cn } from "@/lib/utils";
import { ThreadData } from "@liveblocks/node";
import { useIsThreadActive } from "@liveblocks/react-lexical";
import { Thread } from "@liveblocks/react-ui";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  thread: ThreadData<{}>;
}

const ThreadWrapper = ({ thread }: Props) => {
  const isActive = useIsThreadActive(thread.id);

  return (
    <Thread
      thread={thread}
      data-state={isActive ? "active" : null}
      className={cn("comment-thread border", {
        "!border-blue-500 shadow-md": isActive,
        "opacity-40": thread.resolved,
      })}
    />
  );
};

export default ThreadWrapper;
