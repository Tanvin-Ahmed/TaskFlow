// stream api
export const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://task-flow-brown.vercel.app"
    : "http://localhost:3000";
