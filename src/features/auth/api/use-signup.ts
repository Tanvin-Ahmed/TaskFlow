import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

type ResponseType = InferResponseType<
  (typeof client.api.auth)["sign-up"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.auth)["sign-up"]["$post"]
>;

export const useSignUp = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const res = await client.api.auth["sign-up"]["$post"]({ json });
      return await res.json();
    },
  });

  return mutation;
};
