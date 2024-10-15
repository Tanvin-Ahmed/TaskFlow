import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Props {
  image?: string;
  name: string;
  className?: string;
  fallbackClassName?: string;
}

const ProjectAvatar = ({
  name,
  className,
  image,
  fallbackClassName,
}: Props) => {
  if (image) {
    return (
      <div
        className={cn("relative size-5 overflow-hidden rounded-md", className)}
      >
        <Image src={image} alt={name} fill className="object-cover" />
      </div>
    );
  }

  return (
    <Avatar
      className={cn("relative size-5 overflow-hidden rounded-md", className)}
    >
      <AvatarFallback
        className={cn(
          "rounded-sm bg-purple-600 text-sm font-semibold uppercase text-white",
          fallbackClassName,
        )}
      >
        {name[0]}
      </AvatarFallback>
    </Avatar>
  );
};

export default ProjectAvatar;
