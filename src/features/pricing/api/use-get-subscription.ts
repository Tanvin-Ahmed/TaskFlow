import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

interface Props {
  userId: string;
}

export const useGetSubscription = ({ userId }: Props) => {
  const query = useQuery({
    queryKey: ["subscription", userId],
    queryFn: async () => {
      const response = await client.api.pricing.$get();

      if (!response.ok) {
        return null;
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
