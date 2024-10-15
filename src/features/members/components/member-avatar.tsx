import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  className?: string;
  fallbackClassName?: string;
}

const MemberAvatar = ({ name, className, fallbackClassName }: Props) => {
  return (
    <Avatar
      className={cn(
        "relative size-8 overflow-hidden rounded-full border border-neutral-300 transition",
        className,
      )}
    >
      <AvatarFallback
        className={cn(
          "flex items-center justify-center bg-neutral-200 font-medium text-neutral-500 dark:bg-purple-900/30 dark:text-purple-500",
          fallbackClassName,
        )}
      >
        {name[0].toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};

export default MemberAvatar;
