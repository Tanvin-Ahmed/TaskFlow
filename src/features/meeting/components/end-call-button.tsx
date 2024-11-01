"use client";

import { Button } from "@/components/ui/button";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { usePathname, useRouter } from "next/navigation";

const EndCallButton = () => {
  const router = useRouter();
  const pathname = usePathname();
  const call = useCall();
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const isMeetingOwner =
    localParticipant &&
    call?.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  if (!isMeetingOwner) {
    return null;
  }

  return (
    <Button
      onClick={async () => {
        await call.endCall();
        router.push(`${pathname.split("meeting")[0]}/meeting`);
      }}
      variant={"destructive"}
      size={"sm"}
    >
      Close the meeting
    </Button>
  );
};

export default EndCallButton;
