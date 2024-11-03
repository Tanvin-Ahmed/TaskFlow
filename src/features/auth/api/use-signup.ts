import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.auth)["sign-up"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.auth)["sign-up"]["$post"]
>;

export const useSignUp = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const res = await client.api.auth["sign-up"]["$post"]({ json });

      if (!res.ok) {
        const errorData = (await res.json()) as {
          error: string;
        };
        throw new Error(errorData?.error || "Failed to join workspace");
      }

      return await res.json();
    },
    onSuccess: () => {
      toast.success("Welcome to Task flow!");
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ["current"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong. Please try again!");
    },
  });

  return mutation;
};
