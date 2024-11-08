import { Hono } from "hono";
import { Liveblocks } from "@liveblocks/node";
import { sessionMiddleware } from "@/lib/session-middleware";
import { getUserColor } from "@/lib/utils";
import { StatusCode } from "hono/utils/http-status";

export const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

const app = new Hono().post("/", sessionMiddleware, async (c) => {
  const authUser = c.get("user");

  const user = {
    id: authUser.$id,
    info: {
      id: authUser.$id,
      email: authUser.email,
      name: authUser?.name,
      color: getUserColor(authUser.$id),
    },
  };

  const { status, body } = await liveblocks.identifyUser(
    {
      userId: user.info.email,
      groupIds: [],
    },
    { userInfo: user.info },
  );

  return c.text(body, status as StatusCode);
});

export default app;
