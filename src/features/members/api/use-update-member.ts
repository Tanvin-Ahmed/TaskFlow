import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";

type ResponseType = InferResponseType<
  (typeof client.api.members)[":memberId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.members)[":memberId"]["$patch"]
>;

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      const res = await client.api.members[":memberId"]["$patch"]({
        param,
        json,
      });

      if (!res.ok) {
        const errorData = (await res.json()) as {
          error: string;
        };
        throw new Error(errorData?.error || "Failed to update member");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update member");
    },
  });

  return mutation;
};
