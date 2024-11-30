import { Button } from "@/components/ui/button";
import { PopulatedNotification } from "../type";
import TimeAgo from "react-timeago";
import { FiArrowUpRight } from "react-icons/fi";
import Link from "next/link";
import WorkspaceAvatar from "@/features/workspaces/components/workspace-avatar";
import { getSubstring } from "@/lib/utils";
import { useCurrent } from "@/features/auth/api/use-current";

interface Props {
  notification: PopulatedNotification;
}

const NotificationCard = ({ notification }: Props) => {
  const { data: user } = useCurrent();

  return (
    <div className="space-y-1 overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-0.5">
          <WorkspaceAvatar
            name={notification.workspace.name}
            image={notification.workspace.imageUrl}
            className="size-5"
          />
          <p
            className="truncate text-sm font-semibold"
            title={notification.workspace.name}
          >
            {getSubstring(notification.workspace.name, 15)}
          </p>
        </div>
        <div className="flex items-center gap-1 text-nowrap text-xs text-gray-700 dark:text-indigo-200">
          <TimeAgo date={notification.$createdAt} />{" "}
          {user && notification.seenBy?.includes(user.$id) ? null : (
            <span className="relative block size-2 rounded-full bg-primary">
              <span className="absolute inset-0 z-20 size-2 animate-ping rounded-full bg-primary" />
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{notification.message}</p>
      {notification.link ? (
        <Button size={"sm"} className="h-5 w-full p-1" asChild>
          <Link href={notification.link} className="h-full w-full">
            <FiArrowUpRight /> &nbsp;{" "}
            {notification.isMeetingNotification
              ? "Join meeting"
              : "Check the update"}
          </Link>
        </Button>
      ) : null}
    </div>
  );
};

export default NotificationCard;
