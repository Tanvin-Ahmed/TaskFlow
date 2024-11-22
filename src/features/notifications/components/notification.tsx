"use client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BellIcon } from "lucide-react";
import NotificationList from "./notification-list";
import DottedSeparator from "@/components/custom/shared/dotted-separator";
import { useUnreadInboxNotificationsCount } from "@liveblocks/react/suspense";
import DocNotificationList from "@/features/live-block/components/doc-notification-list";
import { cn } from "@/lib/utils";
import useAppWrite from "@/hooks/use-app-write";
import { useEffect } from "react";
import { DATABASE_ID, NOTIFICATIONS_ID } from "@/config";
import useNotifications from "../api/use-notifications";
import { useQueryClient } from "@tanstack/react-query";
import { PopulatedNotification } from "../type";

const Notification = () => {
  const queryClient = useQueryClient();
  const { count } = useUnreadInboxNotificationsCount();
  const { data: notifications, isLoading } = useNotifications();

  const { client } = useAppWrite();

  useEffect(() => {
    if (!client) return;

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${NOTIFICATIONS_ID}.documents`,
      (response) => {
        if (response.events.some((event) => event.includes(".create"))) {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      },
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [client, queryClient]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size={"icon"}
          variant={"outline"}
          className={cn("relative rounded-full", {
            "animate-pulse": isLoading,
          })}
        >
          {isLoading ? (
            <div className="size-4" />
          ) : (
            <>
              <BellIcon className="size-4" />
              {count > 0 ||
              (notifications && notifications.unseenNotificationCount > 0) ? (
                <>
                  <span className="absolute right-2 top-2 z-20 size-2 animate-ping rounded-full bg-primary" />
                  <span className="absolute right-2 top-2 z-20 size-2 rounded-full bg-primary" />
                </>
              ) : null}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-h-[88vh] space-y-4 overflow-hidden">
        <p className="mb-4 text-xs">Notifications</p>
        {notifications ? (
          <NotificationList
            className="max-h-[38vh] overflow-y-auto"
            notifications={
              notifications.notifications as PopulatedNotification[]
            }
          />
        ) : null}
        <DottedSeparator />
        <p className="mb-4 text-xs">Doc Notifications</p>
        <DocNotificationList className="max-h-[38vh] overflow-y-auto" />
      </PopoverContent>
    </Popover>
  );
};

export default Notification;
