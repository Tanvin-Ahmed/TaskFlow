"use client";
import { Calendar, PlusIcon, UserRoundPlus, Video } from "lucide-react";
import HomeCard from "./home-card";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import MeetingModal from "./meeting-modal";
import { Models } from "node-appwrite";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { toast } from "sonner";

const cardData = [
  {
    id: 1,
    title: "New Meeting",
    description: "Start an instant meeting",
    Icon: PlusIcon,
    className: "bg-orange-600",
  },
  {
    id: 2,
    title: "Join Meeting",
    description: "Via invitation link",
    Icon: UserRoundPlus,
    className: "bg-sky-600",
  },
  {
    id: 3,
    title: "Schedule Meeting",
    description: "Plan your meeting",
    Icon: Calendar,
    className: "bg-purple-600",
  },
  {
    id: 4,
    title: "View Records",
    description: "Meeting Recordings",
    Icon: Video,
    className: "bg-yellow-500",
  },
];

interface Props {
  user: Models.User<Models.Preferences>;
}

const MeetingTypeList = ({ user }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const client = useStreamVideoClient();

  const [meetingState, setMeetingState] = useState<
    "isScheduleMeeting" | "isJoiningMeeting" | "isInstantMeeting" | undefined
  >();
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: "",
    link: "",
  });
  const [callDetails, setCallDetails] = useState<Call>();

  const createMeeting = async () => {
    if (!user || !client) return;

    try {
      if (!values.dateTime) {
        toast.warning("Please select a date and time");
        return;
      }

      const id = crypto.randomUUID();
      const call = client.call("default", id);

      if (!call) return toast.error("Failed to create meeting");

      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || "Instant meeting";

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });

      setCallDetails(call);

      if (!values.description) {
        router.push(`${pathname}/${call.id}`);
      }

      toast.success("Meeting created");
    } catch (error) {
      console.log(error);
      toast.error("Failed to create meeting");
    }
  };

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <HomeCard
        {...cardData[0]}
        handleClick={() => setMeetingState("isInstantMeeting")}
      />
      <HomeCard
        {...cardData[1]}
        handleClick={() => setMeetingState("isJoiningMeeting")}
      />
      <HomeCard
        {...cardData[2]}
        handleClick={() => setMeetingState("isScheduleMeeting")}
      />
      <HomeCard
        {...cardData[3]}
        handleClick={() => router.push(`${pathname}/recordings`)}
      />

      <MeetingModal
        isOpen={meetingState === "isInstantMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Start an Instant Meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={createMeeting}
      />
    </section>
  );
};

export default MeetingTypeList;
