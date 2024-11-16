import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

interface Props {
  projectId?: string;
}

export const useGetWorkspaceByProjectId = ({ projectId }: Props) => {
  const query = useQuery({
    queryKey: ["notification", projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const response = await client.api.workspaces[":projectId"].workspace.$get(
        {
          param: { projectId },
        },
      );

      if (!response.ok) {
        return null;
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
