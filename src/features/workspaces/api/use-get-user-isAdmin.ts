import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

interface Props {
  workspaceId: string;
  userId: string;
}

export const useGetUserIsAdmin = ({ workspaceId, userId }: Props) => {
  const query = useQuery({
    queryKey: ["isAdmin", workspaceId, userId],
    queryFn: async () => {
      const response = await client.api.workspaces[":workspaceId"][
        "isAdmin"
      ].$get({
        param: { workspaceId },
      });

      if (!response.ok) {
        return null;
      }

      const { isAdmin } = await response.json();
      return isAdmin;
    },
  });

  return query;
};
