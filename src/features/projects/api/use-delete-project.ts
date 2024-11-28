import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<
  (typeof client.api.projects)[":projectId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.projects)[":projectId"]["$delete"]
>;

export const useDeleteProject = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const res = await client.api.projects[":projectId"].$delete({
        param,
      });

      if (!res.ok) {
        const errorData = (await res.json()) as {
          error: string;
        };
        console.log(errorData);
        throw new Error(errorData?.error || "Failed to delete the project!");
      }

      return await res.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Project deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", data.$id] });

      router.push(`/dashboard/workspaces/${data.workspaceId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return mutation;
};
