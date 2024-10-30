import { StreamClientProvider } from "@/features/meeting/providers/stream-client-provider";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const MeetingLayout = ({ children }: Props) => {
  return <StreamClientProvider>{children}</StreamClientProvider>;
};

export default MeetingLayout;
