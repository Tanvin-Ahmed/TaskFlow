"use client";
import { useThreads } from "@liveblocks/react/suspense";
import { Composer } from "@liveblocks/react-ui";
import ThreadWrapper from "./thread-wrapper";

const Comments = () => {
  const { threads } = useThreads();
  return (
    <div className="comments-container">
      <Composer className="comment-composer" />
      {threads.map((thread) => (
        <ThreadWrapper key={thread.id} thread={thread} />
      ))}
    </div>
  );
};

export default Comments;
