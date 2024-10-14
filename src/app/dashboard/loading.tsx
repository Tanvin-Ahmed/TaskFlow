import { Loader } from "lucide-react";

const DashboardLoading = () => {
  return (
    <div className="flex h-[70vh] w-full items-center justify-center">
      <Loader className="size-10 animate-spin text-muted-foreground" />
    </div>
  );
};

export default DashboardLoading;
