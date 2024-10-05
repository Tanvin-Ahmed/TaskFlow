import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

const CustomAvatar = ({ src, alt, className }: Props) => {
  return (
    <Avatar className={className ?? ""}>
      <AvatarImage src={src} />
      <AvatarFallback>{alt}</AvatarFallback>
    </Avatar>
  );
};

export default CustomAvatar;
