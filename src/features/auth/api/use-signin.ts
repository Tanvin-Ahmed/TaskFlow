import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.auth)["sign-in"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.auth)["sign-in"]["$post"]
>;

export const useSignIn = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const res = await client.api.auth["sign-in"]["$post"]({ json });

      if (!res.ok) throw new Error("Failed to sign in");

      return await res.json();
    },
    onSuccess: () => {
      toast.success("Welcome back!");
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ["current"] });
    },
    onError: () => {
      toast.error(
        "Something went wrong. Please try again with correct credentials!",
      );
    },
  });

  return mutation;
};
