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

export const useSignIn = (callbackUrl = "/dashboard") => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const res = await client.api.auth["sign-in"]["$post"]({ json });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "Failed to sign in";
        throw new Error(message);
      }

      return data as ResponseType;
    },
    onSuccess: () => {
      toast.success("Welcome back!");
      queryClient.invalidateQueries({ queryKey: ["current"] });
      router.push(callbackUrl);
      router.refresh();
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Something went wrong. Please try again with correct credentials!",
      );
    },
  });

  return mutation;
};
