import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  const user = await currentUser();

  if (!user?.id) return redirect("/sign-in");

  return (
    <main className="container mx-auto max-h-[100%] min-h-[100vh] w-full space-y-20 px-4"></main>
  );
};

export default Dashboard;
