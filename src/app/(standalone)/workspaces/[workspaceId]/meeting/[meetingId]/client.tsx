"use client";
import MeetingRoom from "@/features/meeting/components/meeting-room";
import MeetingSetup from "@/features/meeting/components/meeting-setup";
import useMeetingId from "@/features/meeting/hooks/use-meeting-id";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { Models } from "node-appwrite";
import { useState } from "react";

interface Props {
  user: Models.User<Models.Preferences>;
}

const MeetingRoomClient = ({ user }: Props) => {
  const meetingId = useMeetingId();

  const [isSetupComplete, setIsSetupComplete] = useState(false);

  return (
    <main className="h-screen w-full">
      <StreamCall>
        <StreamTheme>
          {!isSetupComplete ? <MeetingSetup /> : <MeetingRoom />}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default MeetingRoomClient;
