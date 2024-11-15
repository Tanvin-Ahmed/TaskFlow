"use client";
import {
  useInboxNotifications,
  useUnreadInboxNotificationsCount,
} from "@liveblocks/react/suspense";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BellIcon } from "lucide-react";
import {
  InboxNotification,
  InboxNotificationList,
  LiveblocksUIConfig,
} from "@liveblocks/react-ui";

const Notification = () => {
  const { inboxNotifications } = useInboxNotifications();
  const { count } = useUnreadInboxNotificationsCount();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size={"icon"}
          variant={"outline"}
          className="relative rounded-full"
        >
          <BellIcon className="size-4" />

          {count > 0 ? (
            <>
              <span className="absolute right-2 top-2 z-20 size-2 animate-ping rounded-full bg-primary" />
              <span className="absolute right-2 top-2 z-20 size-2 rounded-full bg-primary" />
            </>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end">
        <LiveblocksUIConfig
          overrides={{
            INBOX_NOTIFICATION_TEXT_MENTION(user) {
              return <>{user} mention you.</>;
            },
          }}
        >
          <InboxNotificationList>
            {inboxNotifications.length <= 0 ? (
              <p className="py-2 text-center text-muted">
                No new notifications
              </p>
            ) : (
              inboxNotifications.map((notification) => (
                <InboxNotification
                  className="text-white"
                  key={notification.id}
                  inboxNotification={notification}
                  showActions={false}
                  kinds={{
                    thread: (props) => (
                      <InboxNotification.Thread
                        {...props}
                        showActions={false}
                        showRoomName={false}
                      />
                    ),
                    textMention: (props) => (
                      <InboxNotification.TextMention
                        {...props}
                        showActions={false}
                        showRoomName={false}
                      />
                    ),
                    // $documentAccess: (props) => (
                    //   <InboxNotification.Custom
                    //     {...props}
                    //     title={props.inboxNotification.activities[0].data.title}
                    //     aside={
                    //       <InboxNotification.Icon className="bg-transparent">
                    //         <MemberAvatar
                    //           name={
                    //             (props.inboxNotification.activities[0].data
                    //               .name as string) || ""
                    //           }
                    //           className="size-7"
                    //         />
                    //       </InboxNotification.Icon>
                    //     }
                    //   >
                    //     {props.children}
                    //   </InboxNotification.Custom>
                    // ),
                  }}
                />
              ))
            )}
          </InboxNotificationList>
        </LiveblocksUIConfig>
      </PopoverContent>
    </Popover>
  );
};

export default Notification;
