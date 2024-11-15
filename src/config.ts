export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const WORKSPACES_ID = process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID!;
export const MEMBERS_ID = process.env.NEXT_PUBLIC_APPWRITE_MEMBERS_ID!;
export const PROJECTS_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID!;
export const TASKS_ID = process.env.NEXT_PUBLIC_APPWRITE_TASKS_ID!;
export const IMAGES_BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID!;
export const NOTIFICATIONS_ID =
  process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_ID;

export const USER_PAYMENT_STATUS_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USER_PAYMENT_STATUS_ID!;

// stream api
export const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "http://task-flow-brown.vercel.app"
    : "http://localhost:3000";
