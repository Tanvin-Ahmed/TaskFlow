import { PopulatedNotification } from "../type";
import TimeAgo from "react-timeago";

interface Props {
  notification: PopulatedNotification;
}

const NotificationCard = ({ notification }: Props) => {
  return (
    <div className="space-y-1 overflow-hidden">
      <div className="flex flex-nowrap items-center justify-between gap-3">
        <p className="truncate text-sm font-semibold">
          {notification.workspace.name} Lorem ipsum dolor sit amet consectetur
          adipisicing elit. Nam voluptates blanditiis, animi facere aperiam
          atque illum dolore? Soluta, nostrum. Placeat a odio perferendis
          commodi minus quaerat enim dolore quasi nisi?
        </p>
        <div className="flex items-center gap-1 text-nowrap text-xs text-gray-700 dark:text-indigo-200">
          <TimeAgo date={notification.$createdAt} />{" "}
          <span className="relative block size-2 rounded-full bg-primary">
            <span className="absolute inset-0 z-20 size-2 animate-ping rounded-full bg-primary" />
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{notification.message}</p>
    </div>
  );
};

export default NotificationCard;
