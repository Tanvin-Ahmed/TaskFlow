"use client";
import { useInboxNotifications } from "@liveblocks/react/suspense";
import {
  InboxNotificationList,
  LiveblocksUIConfig,
} from "@liveblocks/react-ui";
import { cn } from "@/lib/utils";
import DocNotificationCard from "./doc-notification-card";

interface Props {
  className?: string;
}

const DocNotificationList = ({ className }: Props) => {
  const { inboxNotifications } = useInboxNotifications();

  return (
    <div className={cn("h-full w-full", className)}>
      <LiveblocksUIConfig
        overrides={{
          INBOX_NOTIFICATION_TEXT_MENTION(user) {
            return <>{user} mention you.</>;
          },
        }}
      >
        <InboxNotificationList>
          {inboxNotifications.length <= 0 ? (
            <p className="py-2 text-center text-muted">No new notifications</p>
          ) : (
            inboxNotifications.map((notification) => (
              <DocNotificationCard
                notification={notification}
                key={notification.id}
              />
            ))
          )}
        </InboxNotificationList>
      </LiveblocksUIConfig>
    </div>
  );
};

export default DocNotificationList;
