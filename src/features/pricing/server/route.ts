import { sessionMiddleware } from "@/lib/session-middleware";
import { Hono } from "hono";
import { getAbsolutePath, PLANS } from "../libs/utils";
import { getUserSubscriptionPlan, stripe } from "./stripe";
import { UserPaymentStatus } from "../types";
import { DATABASE_ID, USER_PAYMENT_STATUS_ID } from "@/config";
import { Query } from "node-appwrite";

const app = new Hono().post("/", sessionMiddleware, async (c) => {
  const databases = c.get("databases");
  const user = c.get("user");

  const dbUser = await databases.listDocuments<UserPaymentStatus>(
    DATABASE_ID,
    USER_PAYMENT_STATUS_ID,
    [Query.equal("userId", user.$id)],
  );

  if (!dbUser.total || !dbUser.documents[0].$id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const billingUrl = getAbsolutePath("/pricing");

  const subscriptionPlan = await getUserSubscriptionPlan();

  if (subscriptionPlan.isSubscribed && dbUser.documents[0].stripeCustomerId) {
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: dbUser.documents[0].stripeCustomerId,
      return_url: "/dashboard",
    });

    return c.json({ url: stripeSession.url });
  }

  const stripeSession = await stripe.checkout.sessions.create({
    success_url: "/dashboard",
    cancel_url: billingUrl,
    payment_method_types: ["card", "paypal"],
    mode: "subscription",
    billing_address_collection: "auto",
    line_items: [
      {
        price: PLANS.find((plan) => plan.name === "Pro")?.price.priceIds.test,
        quantity: 1,
      },
    ],
    metadata: {
      userId: user.$id,
    },
  });

  return c.json({ url: stripeSession.url });
});

export default app;
