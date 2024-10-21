import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

interface Props {
  projectId: string;
}

const useGetProject = ({ projectId }: Props) => {
  const query = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await client.api.projects[":projectId"].$get({
        param: { projectId },
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

export default useGetProject;
