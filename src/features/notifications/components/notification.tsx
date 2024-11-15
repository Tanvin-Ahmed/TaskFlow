"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BellIcon } from "lucide-react";
import NotificationList from "./notification-list";

const Notification = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size={"icon"} variant={"outline"} className="rounded-full">
          <BellIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <NotificationList />
      </PopoverContent>
    </Popover>
  );
};

export default Notification;
