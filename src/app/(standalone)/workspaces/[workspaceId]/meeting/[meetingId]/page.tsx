import { getCurrent } from "@/features/auth/server/queries";
import { redirect } from "next/navigation";
import MemberCheckPage from "./member-check";

const MeetingRoomPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return <MemberCheckPage />;
};

export default MeetingRoomPage;
