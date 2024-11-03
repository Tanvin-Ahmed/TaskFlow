"use client";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import useWorkspaceId from "../hooks/use-workspace-id";
import { useGetSubscription } from "@/features/pricing/api/use-get-subscription";
import { Models } from "node-appwrite";
import { useRouter } from "next/navigation";
import { useGetUserIsOwner } from "../api/use-get-user-isOwner";
import { Workspace } from "../types";
import { toast } from "sonner";
import { LoaderIcon } from "lucide-react";

interface Props {
  user: Models.User<Models.Preferences>;
  workspace: Workspace;
}

const MeetingButton = ({ user, workspace }: Props) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { data: isOwner, isLoading: isLoadingIsOwner } = useGetUserIsOwner({
    workspaceId,
    userId: user.$id,
  });
  const { data: subscription, isLoading: isLoadingSubscription } =
    useGetSubscription({
      userId: workspace.userId,
    });

  const handleCheckIsProUser = () => {
    if (isOwner) {
      if (subscription && subscription.isSubscribed) {
        router.push(`/workspaces/${workspaceId}/meeting`);
      } else {
        router.push(`/pricing`);
      }
    } else {
      if (subscription && subscription.isSubscribed) {
        router.push(`/workspaces/${workspaceId}/meeting`);
      } else {
        toast.error(
          "Workspace owner is not a Pro user of our app to access the meeting feature.",
        );
      }
    }
  };

  const isLoading = isLoadingIsOwner || isLoadingSubscription;

  return (
    <div className="flex items-center justify-end">
      <Button onClick={handleCheckIsProUser} disabled={isLoading}>
        {isLoading ? (
          <LoaderIcon
            className={
              "flex size-4 animate-spin items-center justify-center text-muted-foreground"
            }
          />
        ) : (
          <>
            <Video className="mr-1 size-5" /> Meeting
          </>
        )}
      </Button>
    </div>
  );
};

export default MeetingButton;
