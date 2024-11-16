"use client";

import { InboxNotification } from "@liveblocks/react-ui";
import { InboxNotificationData } from "@liveblocks/core";
import MemberAvatar from "@/features/members/components/member-avatar";
import { useGetWorkspaceByProjectId } from "@/features/workspaces/api/use-get-workspace-by-project-id";

interface Props {
  notification: InboxNotificationData;
}

const DocNotificationCard = ({ notification }: Props) => {
  const { data: workspaceId } = useGetWorkspaceByProjectId({
    projectId: notification.roomId,
  });

  return (
    <InboxNotification
      className="text-white"
      key={notification.id}
      inboxNotification={notification}
      showActions={false}
      href={`/dashboard/workspaces/${workspaceId}/projects/${notification.roomId}/doc`}
      kinds={{
        thread: (props) => (
          <InboxNotification.Thread
            {...props}
            showActions={false}
            showRoomName={false}
          />
        ),
        textMention: (props) => (
          <InboxNotification.TextMention
            {...props}
            showActions={false}
            showRoomName={false}
          />
        ),
        $documentAccess: (props) => (
          <InboxNotification.Custom
            {...props}
            title={props.inboxNotification.activities[0].data.title}
            aside={
              <InboxNotification.Icon className="bg-transparent">
                <MemberAvatar
                  name={
                    (props.inboxNotification.activities[0].data
                      .name as string) || ""
                  }
                  className="size-7"
                />
              </InboxNotification.Icon>
            }
          >
            {props.children}
          </InboxNotification.Custom>
        ),
      }}
    />
  );
};

export default DocNotificationCard;
