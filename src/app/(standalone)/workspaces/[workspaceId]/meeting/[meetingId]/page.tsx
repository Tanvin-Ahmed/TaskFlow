import { getCurrent } from "@/features/auth/server/queries";
import { redirect } from "next/navigation";
import MeetingRoomClient from "./client";

const MeetingRoomPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return <MeetingRoomClient user={user} />;
};

export default MeetingRoomPage;
