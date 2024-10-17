import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

interface Props {
  taskId: string;
}

const useGetTask = ({ taskId }: Props) => {
  const query = useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const response = await client.api.tasks[":taskId"].$get({
        param: { taskId },
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

export default useGetTask;
