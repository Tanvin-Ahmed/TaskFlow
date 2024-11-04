import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useQuery } from "@tanstack/react-query";
import { Models } from "node-appwrite";

interface Props {
  workspaceId: string;
  user: Models.User<Models.Preferences>;
}

const useGetCalls = ({ workspaceId, user }: Props) => {
  // const [calls, setCalls] = useState<Call[]>();
  // const [isLoading, setIsLoading] = useState(false);

  const client = useStreamVideoClient();

  const query = useQuery({
    queryKey: ["meetings", workspaceId],
    queryFn: async () => {
      if (!client || !user?.$id || !workspaceId) return;

      try {
        const { calls } = await client.queryCalls({
          sort: [{ field: "starts_at", direction: -1 }],
          filter_conditions: {
            starts_at: { $exists: true },
            // $or: [
            //   { created_by_user_id: user.$id },
            //   { "custom.members": { $in: [{ user_id: user.$id }] } },
            // ],
            "custom.workspaceId": workspaceId,
          },
        });

        console.log(calls);

        const now = new Date();
        const endedCalls = calls?.filter(
          ({ state: { startsAt, endedAt } }: Call) =>
            (startsAt && new Date(startsAt) < now) || !!endedAt,
        );

        const upcomingCalls = calls?.filter(
          ({ state: { startsAt } }: Call) =>
            startsAt && new Date(startsAt) > now,
        );

        return {
          endedCalls,
          upcomingCalls,
          callRecordings: calls,
        };
      } catch (error) {
        console.log(error);
        return { endedCalls: [], upcomingCalls: [], callRecordings: [] };
      }
    },
  });

  return query;

  // useEffect(() => {
  //   const loadCalls = async () => {
  //     if (!client || !user?.$id || !workspaceId) return;

  //     try {
  //       setIsLoading(true);

  //       const { calls } = await client.queryCalls({
  //         sort: [{ field: "starts_at", direction: -1 }],
  //         filter_conditions: {
  //           starts_at: { $exists: true },
  //           $or: [
  //             { created_by_user_id: user.$id },
  //             { members: { $in: [user.$id] } },
  //           ],
  //           // "custom.workspaceId": workspaceId,
  //         },
  //       });

  //       setCalls(calls);
  //     } catch (error) {
  //       console.log(error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   loadCalls();
  // }, [client, user?.$id, workspaceId]);

  // const now = new Date();
  // const endedCalls = calls?.filter(
  //   ({ state: { startsAt, endedAt } }: Call) =>
  //     (startsAt && new Date(startsAt) < now) || !!endedAt,
  // );

  // const upcomingCalls = calls?.filter(
  //   ({ state: { startsAt } }: Call) => startsAt && new Date(startsAt) > now,
  // );

  // return {
  //   endedCalls,
  //   upcomingCalls,
  //   callRecordings: calls,
  //   isLoading,
  // };
};

export default useGetCalls;
