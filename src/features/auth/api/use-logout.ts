import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType } from "hono";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<
  (typeof client.api.auth.logout)["$delete"]
>;

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api.auth.logout["$delete"]();
      return await res.json();
    },
    onSuccess: () => {
      router.push("/sign-in");
      queryClient.invalidateQueries({ queryKey: ["current"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });

  return mutation;
};
