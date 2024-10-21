import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

interface Props {
  workspaceId: string;
}

export const useGetWorkspace = ({ workspaceId }: Props) => {
  const query = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const response = await client.api.workspaces[":workspaceId"].$get({
        param: { workspaceId },
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
