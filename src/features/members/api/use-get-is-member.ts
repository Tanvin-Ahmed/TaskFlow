import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

interface Props {
  workspaceId: string;
}

export const useGetIsMember = ({ workspaceId }: Props) => {
  const query = useQuery({
    queryKey: ["member", workspaceId],
    queryFn: async () => {
      const response = await client.api.members[":workspaceId"].$get({
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
