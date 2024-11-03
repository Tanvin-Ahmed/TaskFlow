import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<
  (typeof client.api.members)[":memberId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.members)[":memberId"]["$delete"]
>;

export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const res = await client.api.members[":memberId"]["$delete"]({
        param,
      });

      if (!res.ok) {
        const errorData = (await res.json()) as {
          error: string;
        };
        throw new Error(errorData.error || "Failed to delete member");
      }

      return await res.json();
    },
    onSuccess: () => {
      toast.success("Member deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete member");
    },
  });

  return mutation;
};
