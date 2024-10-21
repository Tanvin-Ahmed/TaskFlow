import { getCurrent } from "@/features/auth/server/queries";
import { redirect } from "next/navigation";
import TaskIdClient from "./client";

const TaskDetailsPage = async () => {
  const user = await getCurrent();
  if (!user?.$id) redirect("/sign-in");

  return <TaskIdClient />;
};

export default TaskDetailsPage;
