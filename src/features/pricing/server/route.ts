import { sessionMiddleware } from "@/lib/session-middleware";
import { Hono } from "hono";
import { PLANS } from "../libs/utils";
import { getUserSubscriptionPlan, stripe } from "./stripe";
import { PaymentStatus, UserPaymentStatus } from "../types";
import { DATABASE_ID, USER_PAYMENT_STATUS_ID } from "@/config";
import { Query } from "node-appwrite";

const app = new Hono()
  .post("/", sessionMiddleware, async (c) => {
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

    const billingUrl =
      process.env.NODE_ENV === "production"
        ? "http://task-flow-brown.vercel.app/pricing"
        : "http://localhost:3000/pricing";

    const subscriptionPlan = await getUserSubscriptionPlan();

    if (subscriptionPlan.isSubscribed && dbUser.documents[0].stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.documents[0].stripeCustomerId,
        return_url: billingUrl,
      });

      return c.json({ url: stripeSession.url });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card", "paypal"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.email,
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
  })
  .get("/", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");

    if (!user.$id) {
      return c.json({
        data: {
          ...PLANS[0],
          isSubscribed: false,
          isCanceled: false,
          stripeCurrentPeriodEnd: null,
        },
      });
    }

    const dbUser = await databases.listDocuments<UserPaymentStatus>(
      DATABASE_ID,
      USER_PAYMENT_STATUS_ID,
      [Query.equal("userId", user.$id)],
    );

    if (!dbUser.total) {
      return c.json({
        data: {
          ...PLANS[0],
          isSubscribed: false,
          isCanceled: false,
          stripeCurrentPeriodEnd: null,
        },
      });
    }

    if (
      dbUser.documents[0].paymentStatus === PaymentStatus.Normal ||
      !dbUser.documents[0].stripePriceId
    ) {
      return c.json({
        data: {
          ...PLANS[0],
          isSubscribed: false,
          isCanceled: false,
          stripeCurrentPeriodEnd: null,
        },
      });
    }

    const isSubscribed = Boolean(
      dbUser.documents[0].stripePriceId &&
        dbUser.documents[0].stripeCurrentPeriodEnd && // 86400000 = 1 day
        new Date(dbUser.documents[0].stripeCurrentPeriodEnd).getTime() +
          86_400_000 >
          Date.now(),
    );

    const plan = isSubscribed
      ? PLANS.find(
          (plan) =>
            plan.price.priceIds.test === dbUser.documents[0].stripePriceId,
        )
      : null;

    let isCanceled = false;
    if (isSubscribed && dbUser.documents[0].stripeSubscriptionId) {
      const stripePlan = await stripe.subscriptions.retrieve(
        dbUser.documents[0].stripeSubscriptionId,
      );
      isCanceled = stripePlan.cancel_at_period_end;
    }

    return c.json({
      data: {
        ...plan,
        stripeSubscriptionId: dbUser.documents[0].stripeSubscriptionId,
        stripeCurrentPeriodEnd: dbUser.documents[0].stripeCurrentPeriodEnd,
        stripeCustomerId: dbUser.documents[0].stripeCustomerId,
        isSubscribed,
        isCanceled,
      },
    });
  });

export default app;
