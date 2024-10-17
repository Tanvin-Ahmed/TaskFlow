import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { PopulatedTask, TaskStatus } from "../types";

interface Props {
  workspaceId: string;
  projectId?: string | undefined;
  assigneeId?: string | undefined;
  status?: TaskStatus | undefined;
  dueDate?: string | undefined;
  search?: string | undefined;
}

const useGetTasks = ({
  workspaceId,
  projectId,
  assigneeId,
  status,
  search,
  dueDate,
}: Props) => {
  const query = useQuery({
    queryKey: [
      "tasks",
      workspaceId,
      projectId,
      assigneeId,
      status,
      search,
      dueDate,
    ],
    queryFn: async () => {
      const response = await client.api.tasks.$get({
        query: { workspaceId, projectId, assigneeId, status, search, dueDate },
      });

      if (!response.ok) {
        return null;
      }

      const { data } = await response.json();
      return { ...data, documents: data.documents as PopulatedTask[] };
    },
  });

  return query;
};

export default useGetTasks;
