import { Client } from "appwrite";

const client = new Client()
  .setEndpoint(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
      "https://fra.cloud.appwrite.io/v1",
  )
  .setProject(
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT || "670a7fd90005842bfcf8",
  );

export { client };

// Ping once in the browser so setup can be confirmed when the app starts.
if (typeof window !== "undefined") {
  client.ping();
}
