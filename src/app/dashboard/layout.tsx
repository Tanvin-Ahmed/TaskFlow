import DashboardNavbar from "@/components/custom/dashboard/shared/navbar";
import Sidebar from "@/components/custom/shared/sidebar/sidebar";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: Props) => {
  return (
    <div className="min-h-screen">
      <div className="flex h-full w-full">
        <div className="fixed left-0 top-0 hidden h-full overflow-y-auto lg:block lg:w-[264px]">
          <Sidebar />
        </div>
        <div className="w-full lg:pl-[264px]">
          <div className="mx-auto h-full max-w-screen-2xl">
            <DashboardNavbar />
            <main className="h-full px-6 py-8">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
