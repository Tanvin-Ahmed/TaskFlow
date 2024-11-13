import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  roomId: string;
}

const useGetDoc = ({ roomId }: Props) => {
  const query = useQuery({
    queryKey: ["docs", roomId],
    queryFn: async () => {
      const response = await client.api.liveblocks[":roomId"].$get({
        param: { roomId },
      });

      if (!response.ok) {
        const errorData = (await response.json()) as {
          error: string;
        };
        toast.error(errorData?.error || "No doc found!");

        return null;
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};

export default useGetDoc;
