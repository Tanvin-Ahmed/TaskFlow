import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
};

const CustomAvatar = ({ src, alt, className, fallbackClassName }: Props) => {
  return (
    <Avatar className={className ?? ""}>
      <AvatarImage src={src} />
      <AvatarFallback className={fallbackClassName}>{alt}</AvatarFallback>
    </Avatar>
  );
};

export default CustomAvatar;
