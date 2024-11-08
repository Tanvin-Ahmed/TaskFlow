"use client";
import MemberAvatar from "@/features/members/components/member-avatar";
import { useOthers } from "@liveblocks/react/suspense";

const ActiveCollaborators = () => {
  const others = useOthers();
  const collaborators = others.map((other) => other.info);

  return (
    <ul className="collaborators-list">
      {collaborators.map(({ id, name, color }) => (
        <li key={id}>
          <MemberAvatar name={name} style={{ border: `3px solid ${color}` }} />
        </li>
      ))}
    </ul>
  );
};

export default ActiveCollaborators;
