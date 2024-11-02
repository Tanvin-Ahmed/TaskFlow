"use client";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useGetMembers } from "@/features/members/api/use-get-members";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";
import { LoaderIcon, TrashIcon } from "lucide-react";
import MemberAvatar from "@/features/members/components/member-avatar";
import { deleteCallById } from "../server/actions";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetUserIsAdmin } from "@/features/workspaces/api/use-get-user-isAdmin";
import { Models } from "node-appwrite";

interface MeetingCardProps {
  title: string;
  date: string;
  icon: string;
  isPreviousMeeting?: boolean;
  buttonIcon1?: string;
  buttonText?: string;
  handleClick: () => void;
  link: string;
  type: "call" | "recordings";
  id: string;
  user: Models.User<Models.Preferences>;
}

const MeetingCard = ({
  icon,
  title,
  date,
  isPreviousMeeting,
  buttonIcon1,
  handleClick,
  link,
  buttonText,
  type,
  id,
  user,
}: MeetingCardProps) => {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const isAdmin = useGetUserIsAdmin({ workspaceId, userId: user.$id });
  const { data: usersInfo, isLoading } = useGetMembers({ workspaceId });

  const [isLoadingDelete, setIsLoadingDelete] = useState(false);

  const handleDeleteMeeting = async (id: string) => {
    try {
      setIsLoadingDelete(true);
      if (type === "recordings") {
      } else {
        await deleteCallById(id);
        queryClient.invalidateQueries({ queryKey: ["meetings", workspaceId] });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingDelete(false);
    }
  };

  return (
    <section className="flex min-h-[258px] w-full flex-col justify-between rounded-[14px] border px-5 py-8 shadow-lg dark:bg-muted xl:max-w-[568px]">
      <article className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-5">
          <Image src={icon} alt="upcoming" width={28} height={28} />
          {isAdmin ? (
            <Button
              variant="destructive"
              size={"icon"}
              onClick={() => handleDeleteMeeting(id)}
              disabled={isLoadingDelete}
            >
              {isLoadingDelete ? (
                <LoaderIcon className="size-4 animate-spin text-muted-foreground" />
              ) : (
                <TrashIcon className="size-4" />
              )}
            </Button>
          ) : null}
        </div>
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold" title={title}>
              {title.length > 30 ? `${title.slice(0, 30)}...` : title}
            </h1>
            <p className="text-base font-normal">{date}</p>
          </div>
        </div>
      </article>
      <article className={cn("relative flex justify-end", {})}>
        <div className="relative flex w-full max-sm:hidden">
          {isLoading ? (
            <LoaderIcon className="size-3 animate-spin text-muted-foreground" />
          ) : (
            usersInfo &&
            usersInfo.documents
              .slice(0, 5)
              .map((user, index) => (
                <MemberAvatar
                  key={user.$id}
                  name={user.name}
                  className={cn({ absolute: index > 0 })}
                  style={{ top: 0, left: index * 28 }}
                />
              ))
          )}
          {usersInfo && usersInfo.total > 5 ? (
            <div className="flex-center border-dark-3 bg-dark-4 absolute left-[136px] size-10 rounded-full border-[5px]">
              +{usersInfo.total - 5}
            </div>
          ) : null}
        </div>
        {!isPreviousMeeting && (
          <div className="flex items-center gap-2">
            <Button onClick={handleClick}>
              {buttonIcon1 && (
                <Image src={buttonIcon1} alt="feature" width={20} height={20} />
              )}
              &nbsp; {buttonText}
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast.success("Link Copied");
              }}
              variant={"outline"}
            >
              <Image
                src="/assets/icons/meeting/copy.svg"
                alt="feature"
                width={20}
                height={20}
              />
              &nbsp; Copy Link
            </Button>
          </div>
        )}
      </article>
    </section>
  );
};

export default MeetingCard;
