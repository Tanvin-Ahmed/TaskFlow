import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  projectId: string;
}

const useGetAssignees = ({ projectId }: Props) => {
  const query = useQuery({
    queryKey: ["assignees", projectId],
    queryFn: async () => {
      const response = await client.api.projects[":projectId"].assignees.$get({
        param: { projectId },
      });

      if (!response.ok) {
        const errorData = (await response.json()) as {
          error: string;
        };
        toast.error(errorData?.error || "No assignees found!");

        return [];
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};

export default useGetAssignees;
