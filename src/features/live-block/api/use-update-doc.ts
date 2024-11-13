import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<
  (typeof client.api.liveblocks.accessModify)[":roomId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.liveblocks.accessModify)[":roomId"]["$patch"]
>;

export const useUpdateDoc = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const res = await client.api.liveblocks.accessModify[":roomId"].$patch({
        json,
        param,
      });

      if (!res.ok) {
        const errorData = (await res.json()) as {
          error: string;
        };
        throw new Error(errorData?.error || "Failed to update doc!");
      }

      return await res.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Update document collaborator successfully!");
      queryClient.invalidateQueries({ queryKey: ["docs", data.id] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return mutation;
};
