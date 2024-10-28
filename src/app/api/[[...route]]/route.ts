import { Hono } from "hono";
import { handle } from "hono/vercel";
import auth from "@/features/auth/server/route";
import workspaces from "@/features/workspaces/server/route";
import members from "@/features/members/server/route";
import projects from "@/features/projects/server/route";
import tasks from "@/features/tasks/server/route";
import pricing from "@/features/pricing/server/route";
import webhooks from "@/features/webhooks/server/route";

const app = new Hono();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route("/api/auth", auth)
  .route("/api/workspaces", workspaces)
  .route("/api/members", members)
  .route("/api/projects", projects)
  .route("/api/tasks", tasks)
  .route("/api/pricing", pricing)
  .route("/webhook", webhooks);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
