import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const useNotifications = () => {
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await client.api.notifications.$get();

      if (!response.ok) {
        return {
          unseenNotificationCount: 0,
          totalNotificationCount: 0,
          notifications: [],
        };
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};

export default useNotifications;
