import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.pricing)["$post"],
  200
>;
type RequestType = InferRequestType<(typeof client.api.pricing)["$post"]>;

export const useCreateStripeSession = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async () => {
      const res = await client.api.pricing["$post"]();

      if (!res.ok) throw new Error("Failed to create stripe session");

      return await res.json();
    },
    onError: () => {
      toast.error("Failed to create stripe session");
    },
  });

  return mutation;
};
