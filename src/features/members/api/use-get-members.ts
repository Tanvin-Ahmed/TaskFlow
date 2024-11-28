import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

interface Props {
  workspaceId: string;
  limit?: number;
}

export const useGetMembers = ({ workspaceId, limit }: Props) => {
  const query = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: async () => {
      const response = await client.api.members.$get({
        query: { workspaceId, limit: limit ? String(limit) : undefined },
      });

      if (!response.ok) {
        return null;
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
