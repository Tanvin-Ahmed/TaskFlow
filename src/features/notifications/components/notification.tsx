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

const Notification = () => {
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
      <PopoverContent className="max-h-[88vh] space-y-4 overflow-hidden">
        <p className="mb-4 text-xs">Notifications</p>
        <NotificationList className="max-h-[38vh] overflow-y-auto" />
        <DottedSeparator />
        <p className="mb-4 text-xs">Doc Notifications</p>
        <DocNotificationList className="max-h-[38vh] overflow-y-auto" />
      </PopoverContent>
    </Popover>
  );
};

export default Notification;
