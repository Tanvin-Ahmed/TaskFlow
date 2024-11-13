import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<
  (typeof client.api.liveblocks)["delete-room"][":roomId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.liveblocks)["delete-room"][":roomId"]["$delete"]
>;

interface Props {
  workspaceId: string;
}

export const useDeleteDoc = ({ workspaceId }: Props) => {
  const router = useRouter();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const res = await client.api.liveblocks["delete-room"][":roomId"].$delete(
        {
          param,
        },
      );

      if (!res.ok) {
        const errorData = (await res.json()) as {
          error: string;
        };
        throw new Error(errorData?.error || "Failed to delete documentation!");
      }

      return await res.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Remove collaborator successfully!");
      router.push(
        `/dashboard/workspaces/${workspaceId}/projects/${data.roomId}`,
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return mutation;
};
