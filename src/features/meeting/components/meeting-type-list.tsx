"use client";
import {
  AlarmClock,
  Calendar,
  CalendarCheck2,
  PlusIcon,
  UserRoundPlus,
  Video,
} from "lucide-react";
import HomeCard from "./home-card";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import MeetingModal from "./meeting-modal";
import { Models } from "node-appwrite";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import ReactDatePicker from "react-datepicker";
import { Input } from "@/components/ui/input";
import { BASE_URL } from "@/config";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";

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
    className: "bg-violet-600",
  },
  {
    id: 4,
    title: "Upcoming Meetings",
    description: "Your upcoming meetings",
    Icon: AlarmClock,
    className: "bg-red-600",
  },
  {
    id: 5,
    title: "Previous Meetings",
    description: "Your completed meetings",
    Icon: CalendarCheck2,
    className: "bg-emerald-600",
  },
  {
    id: 6,
    title: "View Records",
    description: "Meeting Recordings",
    Icon: Video,
    className: "bg-amber-600",
  },
];

interface Props {
  user: Models.User<Models.Preferences>;
}

const MeetingTypeList = ({ user }: Props) => {
  const workspaceId = useWorkspaceId();
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
            workspaceId,
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

  const meetingLink = `${BASE_URL}${pathname}/${callDetails?.id}`;

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
        handleClick={() => router.push(`${pathname}/upcoming`)}
      />
      <HomeCard
        {...cardData[4]}
        handleClick={() => router.push(`${pathname}/previous`)}
      />
      <HomeCard
        {...cardData[5]}
        handleClick={() => router.push(`${pathname}/recordings`)}
      />

      {!callDetails ? (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Create Meeting"
          handleClick={createMeeting}
        >
          <div className="flex w-full flex-col gap-2.5">
            <label className="text-normal text-base leading-[22px]">
              Add a description
            </label>
            <Textarea
              onChange={(e) => {
                setValues((state) => ({
                  ...state,
                  description: e.target.value,
                }));
              }}
            />
          </div>
          <div className="flex w-full flex-col gap-2.5">
            <label className="text-normal text-base leading-[22px]">
              Select Date and Time
            </label>
            <ReactDatePicker
              selected={values.dateTime}
              onChange={(date) => setValues({ ...values, dateTime: date! })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
              className="bg-dark-3 w-full rounded p-2 focus:outline-none"
            />
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Meeting Created"
          className="text-center"
          buttonText="Copy Meeting Link"
          buttonIcon="/assets/icons/meeting/copy.svg"
          image="/assets/icons/meeting/checked.svg"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast.success("Link copied");
          }}
        />
      )}

      <MeetingModal
        isOpen={meetingState === "isInstantMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Start an Instant Meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={createMeeting}
      />

      <MeetingModal
        isOpen={meetingState === "isJoiningMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Join meeting"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={() => router.push(values.link)}
      >
        <Input
          type="text"
          placeholder="Type the link here"
          value={values.link}
          onChange={(e) =>
            setValues((state) => ({ ...state, link: e.target.value }))
          }
        />
      </MeetingModal>
    </section>
  );
};

export default MeetingTypeList;
