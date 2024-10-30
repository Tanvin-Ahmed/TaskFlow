"use client";

import { STREAM_API_KEY } from "@/config";
import { useCurrent } from "@/features/auth/api/use-current";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { ReactNode, useEffect, useState } from "react";
import { tokenProvider } from "../server/actions";
import PageLoader from "@/components/custom/shared/page-loader";

const apiKey = STREAM_API_KEY;

export const StreamClientProvider = ({ children }: { children: ReactNode }) => {
  const { data: user, isLoading: isLoadingUser } = useCurrent();
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();

  useEffect(() => {
    if (isLoadingUser || !user) return;
    if (!apiKey) throw new Error("Stream API key missing");

    const client = new StreamVideoClient({
      apiKey,
      user: {
        id: user.$id,
        name: user.name || user.$id,
      },
      tokenProvider,
    });

    setVideoClient(client);
  }, [user, isLoadingUser]);

  if (!videoClient) return <PageLoader />;

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};
