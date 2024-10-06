import DashboardNavbar from "@/components/custom/dashboard/shared/navbar";
import Sidebar from "@/components/custom/shared/sidebar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  const user = await currentUser();

  if (!user?.id) return redirect("/sign-in");

  return (
    <main className="flex">
      <Sidebar />
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
