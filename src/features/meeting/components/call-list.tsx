"use client";

import { usePathname, useRouter } from "next/navigation";
import useGetCalls from "../hooks/use-get-calls";
import { useCallback, useEffect, useState } from "react";
import { Call, CallRecording } from "@stream-io/video-react-sdk";
import MeetingCard from "./meeting-card";
import PageLoader from "@/components/custom/shared/page-loader";
import { toast } from "sonner";
import { BASE_URL } from "@/config";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";
import { Models } from "node-appwrite";

interface Props {
  type: "ended" | "upcoming" | "recordings";
  user: Models.User<Models.Preferences>;
}

const CallList = ({ type, user }: Props) => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();
  const router = useRouter();
  const { data, isLoading } = useGetCalls({
    workspaceId,
    user,
  });
  const [recordings, setRecordings] = useState<CallRecording[]>();

  const getCalls = useCallback(() => {
    switch (type) {
      case "ended":
        return data?.endedCalls;

      case "recordings":
        return recordings;

      case "upcoming":
        return data?.upcomingCalls;

      default:
        return [];
    }
  }, [type, data, recordings]);

  const getNoCallsMessage = useCallback(() => {
    switch (type) {
      case "ended":
        return "No Previous Calls";

      case "recordings":
        return "No Recordings";

      case "upcoming":
        return "No Upcoming Calls";

      default:
        return "";
    }
  }, [type]);

  useEffect(() => {
    const fetchRecordings = async () => {
      if (!data) return;

      try {
        const callData = await Promise.all(
          data.callRecordings?.map((meeting) => meeting.queryRecordings()) ??
            [],
        );

        const recordings = callData
          .filter((call) => call.recordings.length > 0)
          .flatMap((call) => call.recordings);

        setRecordings(recordings);
      } catch (error) {
        console.log(error);
        toast.error("Try again later.");
      }
    };

    if (type === "recordings") {
      fetchRecordings();
    }
  }, [type, data]);

  if (isLoading) return <PageLoader />;

  const calls = getCalls();
  const noCallMessage = getNoCallsMessage();

  const basePathname = `${pathname.split("meeting")[0]}/meeting`;

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {calls && calls.length > 0 ? (
        calls.map((meeting: Call | CallRecording) => (
          <MeetingCard
            key={(meeting as Call).id}
            user={user}
            id={(meeting as Call).id || (meeting as CallRecording).filename}
            type={type === "recordings" ? "recordings" : "call"}
            icon={
              type === "ended"
                ? "/assets/icons/meeting/previous.svg"
                : type === "upcoming"
                  ? "/assets/icons/meeting/upcoming.svg"
                  : "/assets/icons/meeting/recordings.svg"
            }
            title={
              (meeting as Call).state?.custom?.description ||
              (meeting as CallRecording).filename?.substring(0, 20) ||
              "No Description"
            }
            date={
              (meeting as Call).state?.startsAt?.toLocaleString() ||
              (meeting as CallRecording).start_time?.toLocaleString()
            }
            isPreviousMeeting={type === "ended"}
            link={
              type === "recordings"
                ? (meeting as CallRecording).url
                : `${BASE_URL}${basePathname}/${(meeting as Call).id}`
            }
            buttonIcon1={
              type === "recordings"
                ? "/assets/icons/meeting/play.svg"
                : undefined
            }
            buttonText={type === "recordings" ? "Play" : "Start"}
            handleClick={
              type === "recordings"
                ? () => router.push(`${(meeting as CallRecording).url}`)
                : () => router.push(`${basePathname}/${(meeting as Call).id}`)
            }
          />
        ))
      ) : (
        <h1 className="text-2xl font-bold text-white">{noCallMessage}</h1>
      )}
    </div>
  );
};

export default CallList;
