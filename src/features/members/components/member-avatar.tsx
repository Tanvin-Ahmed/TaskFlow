import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  className?: string;
  fallbackClassName?: string;
  style?: object;
}

const MemberAvatar = ({ name, className, fallbackClassName, style }: Props) => {
  return (
    <Avatar
      className={cn(
        "relative size-8 overflow-hidden rounded-full border border-neutral-300 transition",
        className,
      )}
      style={style}
    >
      <AvatarFallback
        className={cn(
          "flex items-center justify-center bg-neutral-200 font-medium !text-neutral-500 dark:bg-purple-900/30 dark:text-purple-100",
          fallbackClassName,
        )}
      >
        {name[0].toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};

export default MemberAvatar;
