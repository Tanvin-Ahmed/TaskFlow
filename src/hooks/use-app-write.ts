import { Account, Client, Databases } from "appwrite";

const useAppWrite = () => {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

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
