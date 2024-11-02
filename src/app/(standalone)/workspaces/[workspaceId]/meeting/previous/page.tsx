import { getCurrent } from "@/features/auth/server/queries";
import CallList from "@/features/meeting/components/call-list";
import { redirect } from "next/navigation";

const PreviousMeetingPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <section className="flex size-full flex-col gap-10">
      <h1 className="text-3xl font-bold">Previous</h1>

      <CallList type="ended" user={user} />
    </section>
  );
};

export default PreviousMeetingPage;
