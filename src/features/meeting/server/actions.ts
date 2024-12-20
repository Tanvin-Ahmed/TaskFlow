"use server";

import { STREAM_API_KEY } from "@/config";
import { getCurrent } from "@/features/auth/server/queries";
import { StreamClient } from "@stream-io/node-sdk";

const streamAPIKey = STREAM_API_KEY;
const streamSecretKey = process.env.STREAM_SECRET_KEY;

export const tokenProvider = async () => {
  const user = await getCurrent();
  if (!user) throw new Error("User not logged in");
  if (!streamAPIKey) throw new Error("Stream API key not available");
  if (!streamSecretKey) throw new Error("No API secret");

  const streamClient = new StreamClient(streamAPIKey, streamSecretKey);
  const exp = Math.round(new Date().getTime() / 1000) + 60 * 60;
  const issued = Math.floor(Date.now() / 1000) - 60;

  const token = streamClient.generateUserToken({
    user_id: user.$id,
    validity_in_seconds: exp,
    iat: issued,
  });

  return token;
};

export const createGetStreamUsers = async (
  usersId: {
    user_id: string;
  }[],
) => {
  const user = await getCurrent();
  if (!user) throw new Error("User not logged in");
  if (!streamAPIKey) throw new Error("Stream API key not available");
  if (!streamSecretKey) throw new Error("No API secret");

  const streamClient = new StreamClient(streamAPIKey, streamSecretKey);

  const usersInfo = usersId.map((user) => ({ id: user.user_id }));
  await streamClient.upsertUsers(usersInfo);
  // await streamClient.deleteUsers({
  //   user_ids: usersInfo.map((userId) => userId.id),
  // });
};

export const deleteCallById = async (id: string) => {
  const user = await getCurrent();
  if (!user) throw new Error("User not logged in");
  if (!streamAPIKey) throw new Error("Stream API key not available");
  if (!streamSecretKey) throw new Error("No API secret");

  const client = new StreamClient(streamAPIKey, streamSecretKey);

  await client.video.deleteCall({ id, type: "default" });
};
