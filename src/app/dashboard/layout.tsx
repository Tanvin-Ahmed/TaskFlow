import DashboardNavbar from "@/components/custom/dashboard/shared/navbar";
import Sidebar from "@/components/custom/shared/sidebar/sidebar";
import { getCurrent } from "@/features/auth/server/queries";
import CreateProjectModal from "@/features/projects/components/create-project-modal";
import CreateTaskModal from "@/features/tasks/components/create-task-modal";
import UpdateTaskModal from "@/features/tasks/components/update-task-modal";
import CreateWorkspaceModal from "@/features/workspaces/components/create-workspace-modal";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const DashboardLayout = async ({ children }: Props) => {
  const user = await getCurrent();
  if (!user) redirect("sign-in");

  return (
    <div className="min-h-screen">
      <CreateWorkspaceModal />
      <CreateProjectModal />
      <CreateTaskModal />
      <UpdateTaskModal />
      <div className="flex h-full w-full">
        <div className="fixed left-0 top-0 hidden h-full overflow-y-auto lg:block lg:w-[264px]">
          <Sidebar user={user} />
        </div>
        <div className="w-full lg:pl-[264px]">
          <div className="mx-auto h-full max-w-screen-2xl">
            <DashboardNavbar user={user} />
            <main className="h-full px-6 py-8">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
