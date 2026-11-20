import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

interface Props {
  workspaceId: string;
  userId: string;
}

export const useGetUserIsAdmin = ({ workspaceId, userId }: Props) => {
  const query = useQuery({
    queryKey: ["isOwner", workspaceId, userId],
    queryFn: async () => {
      const response = await client.api.workspaces[":workspaceId"][
        "isOwner"
      ].$get({
        param: { workspaceId },
      });

      if (!response.ok) {
        return null;
      }

      const { isOwner } = await response.json();
      return isOwner;
    },
  });

  return query;
};
