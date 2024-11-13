"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import PageLoader from "../custom/shared/page-loader";
import { getCurrent, getUsers } from "@/features/auth/server/queries";
import { getDocumentUsers } from "@/features/live-block/server/actions";

interface Props {
  children: ReactNode;
}

const LiveBlockProvider = ({ children }: Props) => {
  return (
    <LiveblocksProvider
      authEndpoint={"/api/liveblocks"}
      resolveUsers={async ({ userIds }) => {
        const usersInfo = await getUsers(userIds);
        return usersInfo;
      }}
      resolveMentionSuggestions={async ({ text, roomId }) => {
        const user = await getCurrent();

        const roomUsers = await getDocumentUsers({
          roomId,
          currentUser: user ? user.email : "",
          text,
        });

        return roomUsers;
      }}
    >
      <ClientSideSuspense fallback={<PageLoader />}>
        {children}
      </ClientSideSuspense>
    </LiveblocksProvider>
  );
};

export default LiveBlockProvider;
