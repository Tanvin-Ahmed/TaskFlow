import { StreamClientProvider } from "@/features/meeting/providers/stream-client-provider";
import { ReactNode } from "react";

import "@stream-io/video-react-sdk/dist/css/styles.css";

interface Props {
  children: ReactNode;
}

const MeetingLayout = ({ children }: Props) => {
  return <StreamClientProvider>{children}</StreamClientProvider>;
};

export default MeetingLayout;
