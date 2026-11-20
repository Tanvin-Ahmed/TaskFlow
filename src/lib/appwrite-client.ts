import { Client } from "appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("670a7fd90005842bfcf8");

export { client };

// Ping once in the browser so setup can be confirmed when the app starts.
if (typeof window !== "undefined") {
  client.ping();
}
