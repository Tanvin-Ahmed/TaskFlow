import { getCurrent } from "@/features/auth/server/queries";
import MeetingTypeList from "@/features/meeting/components/meeting-type-list";
import { redirect } from "next/navigation";

const MeetingPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const now = new Date();

  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
    now,
  );

  return (
    <section className="flex size-full flex-col gap-10">
      <div className="bg-meeting-hero dark:bg-meeting-hero-dark h-[300px] w-full rounded-[20px] bg-cover">
        <div className="mx-md:py-8 flex h-full flex-col justify-between px-5 py-5 lg:p-11">
          <h2 className="glassmorphism z-0 max-w-[270px] rounded py-2 text-center text-base font-normal">
            Upcoming Meeting at: 12:30 PM
          </h2>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold lg:text-7xl">{time}</h1>
            <p className="text-lg font-medium text-sky-600 lg:text-2xl">
              {date}
            </p>
          </div>
        </div>
      </div>

      <MeetingTypeList user={user} />
    </section>
  );
};

export default MeetingPage;
