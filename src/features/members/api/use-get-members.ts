import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

interface Props {
  workspaceId: string;
}

export const useGetMembers = ({ workspaceId }: Props) => {
  const query = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: async () => {
      const response = await client.api.members.$get({
        query: { workspaceId },
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
