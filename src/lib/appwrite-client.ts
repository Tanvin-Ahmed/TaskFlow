import { Client } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

export { client };
// Ping once in the browser so setup can be confirmed when the app starts.
if (typeof window !== "undefined") {
  client
    .ping()
    .then(() => console.log("[Appwrite] ping ok"))
    .catch((err) => console.error("[Appwrite] ping failed", err));
}
