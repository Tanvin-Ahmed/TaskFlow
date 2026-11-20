import Cookies from "js-cookie";
import { Account, Databases } from "appwrite";
import { client } from "@/lib/appwrite-client";
import { AUTH_COOKIE } from "@/features/auth/constant";

const useAppWrite = () => {
  const session = Cookies.get(AUTH_COOKIE);

  if (session) {
    client.setSession(session);
  }

  return {
    account: new Account(client),
    databases: new Databases(client),
    client,
  };
};

export default useAppWrite;
