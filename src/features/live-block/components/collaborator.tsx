"use client";
import { useState } from "react";
import { UserType } from "../types";
import MemberAvatar from "@/features/members/components/member-avatar";
import UserTypeSelector from "./user-type-selector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUpdateDoc } from "../api/use-update-doc";
import { LoaderIcon } from "lucide-react";
import { useRemoveCollaborator } from "../api/use-remove-collaborator";

interface Props {
  creatorId: string;
  roomId: string;
  collaborator: {
    userType: UserType;
    id: string;
    name: string;
    email: string;
    color: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    color: string;
  };
}

const Collaborator = ({ collaborator, creatorId, roomId, user }: Props) => {
  const { mutate: updateDoc, isPending: isPendingUpdate } = useUpdateDoc();
  const { mutate: removeCollaborator, isPending: isPendingRemove } =
    useRemoveCollaborator();

  const [userType, setUserType] = useState<UserType>(
    collaborator.userType || "viewer",
  );

  const handleDocAccess = async (type: UserType) => {
    updateDoc({
      json: {
        emails: [collaborator.email],
        userType: type,
        updatedBy: {
          email: user.email,
          name: user.name,
        },
      },
      param: { roomId },
    });
  };

  const handleRemoveCollaborator = async (email: string) => {
    removeCollaborator({
      param: {
        roomId,
        collaboratorId: email,
      },
    });
  };

  return (
    <div className="flex items-center justify-between gap-2 py-3">
      <div className="flex items-center gap-2">
        <MemberAvatar
          name={collaborator.name}
          className={`size-9`}
          style={{ border: `3px solid ${collaborator.color}` }}
        />
        <div>
          <p className="line-clamp-1 text-sm font-semibold leading-4">
            {collaborator.name}
          </p>
        </div>
      </div>

      {collaborator.id === creatorId ? (
        <Badge>Owner</Badge>
      ) : (
        <div className="flex items-center">
          {isPendingUpdate ? (
            <LoaderIcon className="size-3 animate-spin text-muted-foreground" />
          ) : (
            <UserTypeSelector
              userType={userType}
              setUserType={setUserType}
              onClickHandler={handleDocAccess}
            />
          )}

          <Button
            type="button"
            onClick={() => handleRemoveCollaborator(collaborator.email)}
            size={"sm"}
            variant={"ghost"}
            className="text-red-600 hover:bg-red-900/50 hover:text-red-500"
            disabled={isPendingRemove}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};

export default Collaborator;
