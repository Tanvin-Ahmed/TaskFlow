import { cn } from "@/lib/utils";
import NotificationCard from "./notification-card";
import { PopulatedNotification } from "../type";

interface Props {
  className?: string;
  notifications: PopulatedNotification[];
}

const NotificationList = ({ className, notifications }: Props) => {
  return (
    <div className={cn("h-full w-full space-y-3", className)}>
      {notifications.map((notification) => (
        <NotificationCard key={notification.$id} notification={notification} />
      ))}
    </div>
  );
};

export default NotificationList;
