"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  CallControls,
  CallingState,
  CallParticipantsList,
  CallStatsButton,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { LayoutList, UsersIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import EndCallButton from "./end-call-button";
import PageLoader from "@/components/custom/shared/page-loader";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get("personal");

  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);

  if (callingState !== CallingState.JOINED) return <PageLoader />;

  const CallLayout = () => {
    switch (layout) {
      case "grid":
        return <PaginatedGridLayout />;
      case "speaker-right":
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>

        <div
          className={cn("ml-2 hidden h-[calc(100vh-86px)]", {
            "show-block": showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      <div className="fixed bottom-0 flex w-full items-center gap-5 overflow-auto md:justify-center">
        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger asChild>
              <Button
                className="flex cursor-pointer items-center justify-center rounded-full p-2"
                size={"icon"}
                variant={"secondary"}
              >
                <LayoutList size={20} />
              </Button>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent>
            {["Grid", "Speaker-Left", "Speaker-Right"].map((item, index) => (
              <div key={item}>
                <DropdownMenuItem
                  onClick={() =>
                    setLayout(item.toLowerCase() as CallLayoutType)
                  }
                  className={cn("duration-300", {
                    "bg-purple-600 text-white": layout === item.toLowerCase(),
                  })}
                >
                  {item}
                </DropdownMenuItem>
                {index !== 2 ? <DropdownMenuSeparator /> : null}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <CallControls />
        <CallStatsButton />

        <Button
          className="cursor-pointer rounded-full p-2"
          size={"icon"}
          variant={"secondary"}
          onClick={() => setShowParticipants((state) => !state)}
        >
          <UsersIcon size={20} />
        </Button>

        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;
