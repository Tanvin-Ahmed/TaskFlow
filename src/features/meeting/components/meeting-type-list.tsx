"use client";
import {
  AlarmClock,
  Calendar,
  CalendarCheck2,
  LoaderIcon,
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
import { useGetUserIsAdmin } from "@/features/workspaces/api/use-get-user-isAdmin";
import PageLoader from "@/components/custom/shared/page-loader";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { pushNotification } from "@/features/notifications/server/actions";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";

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

  const { data: workspace, isLoading: isLoadingWorkspace } = useGetWorkspace({
    workspaceId,
  });
  const { data: isAdmin, isLoading: isLoadingIsAdmin } = useGetUserIsAdmin({
    workspaceId,
    userId: user.$id,
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });

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
  const [isCreatingCall, setIsCreatingCall] = useState(false);

  const createMeeting = async () => {
    if (!user || !client) return;

    try {
      setIsCreatingCall(true);
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

      const membersId = members?.documents
        .map((member) => ({
          user_id: member.$id,
        }))
        .filter((member) => member.user_id !== user.$id);

      // await createGetStreamUsers(membersId!);

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
            workspaceId,
            members: membersId,
          },
          // members: membersId,
        },
      });

      setCallDetails(call);

      // that means instant meeting created
      if (!values.description) {
        await pushNotification({
          workspaceId,
          message: `An admin has created an instant meeting and invite all members of ${workspace?.name} workspace to join.`,
          link: `${pathname}/${call.id}`,
          isMeetingNotification: true,
        });

        router.push(`${pathname}/${call.id}`);
      } else {
        await pushNotification({
          workspaceId,
          message: `A meeting has scheduled and invite all members of ${workspace?.name} workspace to join timely.`,
          link: `${pathname}/upcoming`,
          isMeetingNotification: false,
        });
      }

      toast.success("Meeting created");
    } catch (error) {
      console.log(error);
      toast.error("Failed to create meeting");
    } finally {
      setIsCreatingCall(false);
    }
  };

  if (isLoadingIsAdmin || isLoadingWorkspace) return <PageLoader />;

  const meetingLink = `${BASE_URL}${pathname}/${callDetails?.id}`;

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {isAdmin ? (
        <HomeCard
          {...cardData[0]}
          handleClick={() => setMeetingState("isInstantMeeting")}
        />
      ) : null}
      <HomeCard
        {...cardData[1]}
        handleClick={() => setMeetingState("isJoiningMeeting")}
      />
      {isAdmin ? (
        <HomeCard
          {...cardData[2]}
          handleClick={() => setMeetingState("isScheduleMeeting")}
        />
      ) : null}
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
          ButtonIcon={
            isLoadingMembers || isCreatingCall ? LoaderIcon : undefined
          }
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
          ButtonIcon="/assets/icons/meeting/copy.svg"
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
        ButtonIcon={isLoadingMembers || isCreatingCall ? LoaderIcon : undefined}
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
