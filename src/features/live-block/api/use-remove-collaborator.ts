import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<
  (typeof client.api.liveblocks)[":roomId"][":collaboratorId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.liveblocks)[":roomId"][":collaboratorId"]["$delete"]
>;

export const useRemoveCollaborator = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const res = await client.api.liveblocks[":roomId"][
        ":collaboratorId"
      ].$delete({
        param,
      });

      if (!res.ok) {
        const errorData = (await res.json()) as {
          error: string;
        };
        throw new Error(errorData?.error || "Failed to remove collaborator!");
      }

      return await res.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Remove collaborator successfully!");
      queryClient.invalidateQueries({ queryKey: ["docs", data.id] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return mutation;
};
