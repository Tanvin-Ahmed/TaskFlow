"use client";

import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import Link from "next/link";
import useWorkspaceId from "../hooks/use-workspace-id";

const MeetingButton = () => {
  const workspaceId = useWorkspaceId();

  return (
    <div className="flex items-center justify-end">
      <Button asChild>
        <Link className="w-fit" href={`/workspaces/${workspaceId}/meeting`}>
          <Video className="mr-1 size-5" /> Meeting
        </Link>
      </Button>
    </div>
  );
};

export default MeetingButton;
