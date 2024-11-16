import { cn } from "@/lib/utils";
import NotificationCard from "./notification-card";

interface Props {
  className?: string;
}

const NotificationList = ({ className }: Props) => {
  return (
    <div className={cn("h-full w-full space-y-3", className)}>
      <NotificationCard />
      <NotificationCard />
      <NotificationCard />
      <NotificationCard />
      <NotificationCard />
      <NotificationCard />
      <NotificationCard />
      <NotificationCard />
      <NotificationCard />
      <NotificationCard />
      <NotificationCard />
    </div>
  );
};

export default NotificationList;
