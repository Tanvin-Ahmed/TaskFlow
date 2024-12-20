import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<
  (typeof client.api.workspaces)[":workspaceId"]["reset-invite-code"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.workspaces)[":workspaceId"]["reset-invite-code"]["$post"]
>;

export const useResetInviteCode = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const res = await client.api.workspaces[":workspaceId"][
        "reset-invite-code"
      ]["$post"]({
        param,
      });

      if (!res.ok) {
        const errorData = (await res.json()) as {
          error: string;
        };
        throw new Error(errorData.error || "Failed to reset invite code");
      }

      return await res.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Reset invite code successfully!");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces", data.$id] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return mutation;
};
