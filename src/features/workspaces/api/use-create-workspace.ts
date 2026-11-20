import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<(typeof client.api.workspaces)["$post"]>;
type RequestType = InferRequestType<(typeof client.api.workspaces)["$post"]>;

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const res = await client.api.workspaces.$post({ form });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(errorData?.error || "Failed to create workspace");
      }

      return await res.json();
    },
    onSuccess: () => {
      toast.success("Workspace created successfully!");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create workspace!");
    },
  });

  return mutation;
};
