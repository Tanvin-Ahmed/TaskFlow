"use client";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import useWorkspaceId from "../hooks/use-workspace-id";
import { useGetSubscription } from "@/features/pricing/api/use-get-subscription";
import { Models } from "node-appwrite";
import { useRouter } from "next/navigation";

interface Props {
  user: Models.User<Models.Preferences>;
}

const MeetingButton = ({ user }: Props) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { data: subscription } = useGetSubscription({ userId: user.$id });

  const handleCheckIsProUser = () => {
    if (subscription && subscription.isSubscribed) {
      router.push(`/workspaces/${workspaceId}/meeting`);
    } else {
      router.push(`/pricing`);
    }
  };

  return (
    <div className="flex items-center justify-end">
      <Button onClick={handleCheckIsProUser}>
        <Video className="mr-1 size-5" /> Meeting
      </Button>
    </div>
  );
};

export default MeetingButton;
