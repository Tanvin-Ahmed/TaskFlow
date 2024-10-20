"use client";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface Props {
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
}

const CustomToolbar = ({ date, onNavigate }: Props) => {
  return (
    <div className="mb-4 flex w-full items-center justify-center gap-x-2 md:w-auto md:justify-start">
      <Button
        size={"icon"}
        variant={"secondary"}
        onClick={() => onNavigate("PREV")}
        className="flex items-center"
      >
        <ChevronLeftIcon className={"size-4"} />
      </Button>
      <div className="flex h-8 w-full items-center justify-center rounded-md border border-input px-3 py-2 md:w-auto">
        <CalendarIcon className="mr-2 size-4" />
        <p className="text-sm">{format(date, "MMMM yyyy")}</p>
      </div>
      <Button
        size={"icon"}
        variant={"secondary"}
        onClick={() => onNavigate("NEXT")}
        className="flex items-center"
      >
        <ChevronRightIcon className={"size-4"} />
      </Button>
    </div>
  );
};

export default CustomToolbar;
