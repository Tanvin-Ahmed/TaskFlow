import { useParams } from "next/navigation";

const useMeetingId = () => {
  const params = useParams();
  return params.meetingId as string;
};

export default useMeetingId;
