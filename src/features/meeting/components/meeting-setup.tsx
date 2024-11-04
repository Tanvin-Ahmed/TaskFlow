"use client";
import { Button } from "@/components/ui/button";
import {
  DeviceSettings,
  useCall,
  VideoPreview,
} from "@stream-io/video-react-sdk";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface Props {
  setIsSetupComplete: Dispatch<SetStateAction<boolean>>;
}

const MeetingSetup = ({ setIsSetupComplete }: Props) => {
  const call = useCall();
  const [isMicCamToggledOn, setIsMicCamToggledOn] = useState(false);

  if (!call) throw new Error("No call found");

  useEffect(() => {
    if (isMicCamToggledOn) {
      call.camera.disable();
      call.microphone.disable();
    } else {
      call.camera.enable();
      call.camera.enable();
    }
  }, [isMicCamToggledOn, call]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3">
      <h1 className="text-2xl font-bold">Setup</h1>
      <VideoPreview />

      <div className="flex h-16 items-center justify-center gap-3">
        <label className="flex items-center justify-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={isMicCamToggledOn}
            onChange={(e) => setIsMicCamToggledOn(e.target.checked)}
          />
          Join with mic and camera off
        </label>
        <DeviceSettings />
      </div>
      <Button
        onClick={() => {
          setIsSetupComplete(true);
        }}
      >
        Join meeting
      </Button>
    </div>
  );
};

export default MeetingSetup;
