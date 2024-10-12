import DashboardNavbar from "@/components/custom/dashboard/shared/navbar";

const Dashboard = async () => {
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
