import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useUserWith = () => {
  const query = useQuery({
    queryKey: ["user-with"],
    queryFn: async () => {
      const response = await client.api.auth["attached-with"].$get();

      if (!response.ok) {
        return null;
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};

export default useUserWith;
