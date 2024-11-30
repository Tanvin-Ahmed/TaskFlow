import { getCurrent } from "@/features/auth/server/queries";
import MeetingTypeList from "@/features/meeting/components/meeting-type-list";
import ShowTime from "@/features/meeting/components/show-time";
import { redirect } from "next/navigation";

const MeetingPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <section className="flex size-full flex-col gap-10">
      <div className="h-[300px] w-full rounded-[20px] bg-meeting-hero bg-cover dark:bg-meeting-hero-dark">
        <div className="mx-md:py-8 flex h-full flex-col justify-end px-5 py-5 lg:p-11">
          {/* <h2 className="glassmorphism z-0 max-w-[270px] rounded py-2 text-center text-base font-normal">
            Upcoming Meeting at: 12:30 PM
          </h2> */}
          <ShowTime />
        </div>
      </div>

      <MeetingTypeList user={user} />
    </section>
  );
};

export default MeetingPage;
