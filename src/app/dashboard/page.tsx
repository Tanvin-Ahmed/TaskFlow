import DashboardNavbar from "@/components/custom/dashboard/shared/navbar";
import { getCurrent } from "@/features/auth/server/action";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  const user = await getCurrent();

  if (!user) redirect("/sign-in");

  return (
    <main className="flex">
      <section className="w-full">
        <DashboardNavbar />
        <div className="container mx-auto space-y-6 overflow-x-hidden p-2 sm:p-6">
          <h1>Dashboard</h1>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
