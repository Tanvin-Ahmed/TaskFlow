import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

interface Props {
  workspaceId: string;
  limit?: number;
}

const useGetProjects = ({ workspaceId, limit }: Props) => {
  const query = useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      const response = await client.api.projects.$get({
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

export default useGetProjects;
