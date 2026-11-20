import { Account, Databases } from "appwrite";
import { client } from "@/lib/appwrite-client";

const useAppWrite = () => {
  // const session = Cookies.get("task-flow-session");

  // if (!session) {
  //   throw new Error("Unauthorized");
  // }

  // client.setSession(session);

  return {
    account: new Account(client),
    databases: new Databases(client),
    client,
  };
};

export default useAppWrite;
