import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface Props {
  message?: string;
  className?: string;
}

const PageError = ({ message = "Something went wrong", className }: Props) => {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center",
        className,
      )}
    >
      <AlertTriangle className="mb-2 size-6 text-muted-foreground" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
};

export default PageError;
