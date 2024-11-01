"use client";
import PageLoader from "@/components/custom/shared/page-loader";
import MeetingRoom from "@/features/meeting/components/meeting-room";
import MeetingSetup from "@/features/meeting/components/meeting-setup";
import { useGetCallById } from "@/features/meeting/hooks/use-get-call-by-id";
import useMeetingId from "@/features/meeting/hooks/use-meeting-id";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { Models } from "node-appwrite";
import { useState } from "react";

interface Props {
  user: Models.User<Models.Preferences>;
}

const MeetingRoomClient = ({ user }: Props) => {
  const meetingId = useMeetingId();
  const { call, isCallLoading } = useGetCallById(meetingId);

  const [isSetupComplete, setIsSetupComplete] = useState(false);

  if (isCallLoading) return <PageLoader />;

  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default MeetingRoomClient;
