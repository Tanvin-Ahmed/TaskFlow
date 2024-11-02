"use client";
import PageLoader from "@/components/custom/shared/page-loader";
import { useGetIsMember } from "@/features/members/api/use-get-is-member";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import MeetingRoomClient from "./client";

const MemberCheckPage = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { data: isMember, isLoading: isLoadingIsMember } = useGetIsMember({
    workspaceId,
  });

  if (isLoadingIsMember) return <PageLoader message="Member checking" />;

  if (!isMember) {
    toast.warning("You are not a member of this workspace!");
    router.push(`/workspaces/${workspaceId}/meeting`);
  }

  return <MeetingRoomClient />;
};

export default MemberCheckPage;
