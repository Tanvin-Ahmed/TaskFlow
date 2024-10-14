import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Props {
  image?: string;
  name: string;
  className?: string;
}

const WorkspaceAvatar = ({ name, className, image }: Props) => {
  if (image) {
    return (
      <div
        className={cn("relative size-8 overflow-hidden rounded-md", className)}
      >
        <Image src={image} alt={name} fill className="object-cover" />
      </div>
    );
  }

  return (
    <Avatar
      className={cn("relative size-8 overflow-hidden rounded-md", className)}
    >
      <AvatarFallback className="rounded-sm bg-purple-600 text-lg font-semibold uppercase text-white">
        {name[0]}
      </AvatarFallback>
    </Avatar>
  );
};

export default WorkspaceAvatar;
