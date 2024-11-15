import { AUTH_COOKIE } from "@/features/auth/constant";
import Cookies from "js-cookie";
import { Account, Client, Databases, Users } from "node-appwrite";

export const createSessionClient = async () => {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

  const session = Cookies.get(AUTH_COOKIE);

  if (!session) {
    throw new Error("Unauthorized");
  }

  client.setSession(session);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get users() {
      return new Users(client);
    },
  };
};
