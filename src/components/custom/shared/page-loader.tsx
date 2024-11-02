import { Loader } from "lucide-react";

interface Props {
  message?: string;
}

const PageLoader = ({ message }: Props) => {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center">
      <Loader className="size-6 animate-spin text-muted-foreground" />
      <small>{message}</small>
    </div>
  );
};

export default PageLoader;
