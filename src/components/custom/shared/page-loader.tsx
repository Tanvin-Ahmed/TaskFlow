import { Loader } from "lucide-react";

const PageLoader = () => {
  return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
};

export default PageLoader;
