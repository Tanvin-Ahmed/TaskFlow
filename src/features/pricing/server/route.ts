import { sessionMiddleware } from "@/lib/session-middleware";
import { BASE_URL, DATABASE_ID, USER_PAYMENT_STATUS_ID } from "@/config";

import { Hono } from "hono";

import { ID, Permission, Query, Role } from "node-appwrite";

import { PaymentStatus, UserPaymentStatus } from "../types";
import { PLANS } from "../libs/utils";

import { getUserSubscriptionPlan, stripe } from "./stripe";
import { syncSubscriptionFromStripe } from "./sync-subscription";

const app = new Hono()
  .post("/", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    // Ensure Pro status is synced before opening portal/checkout.
    try {
      await syncSubscriptionFromStripe(user.$id, databases);
    } catch (error) {
      console.error("Pre-checkout subscription sync failed:", error);
    }

    let dbUser = await databases.listDocuments<UserPaymentStatus>(
      DATABASE_ID,
      USER_PAYMENT_STATUS_ID,
      [Query.equal("userId", user.$id)],
    );

    // New users may not have a payment-status doc yet (home-page seed can be missed).
    // Create one here instead of returning 401 and blocking Stripe checkout.
    if (!dbUser.total || !dbUser.documents[0].$id) {
      await databases.createDocument(
        DATABASE_ID,
        USER_PAYMENT_STATUS_ID,
        ID.unique(),
        {
          userId: user.$id,
          paymentStatus: PaymentStatus.Normal,
        },
        [
          Permission.read(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any()),
        ],
      );

      dbUser = await databases.listDocuments<UserPaymentStatus>(
        DATABASE_ID,
        USER_PAYMENT_STATUS_ID,
        [Query.equal("userId", user.$id)],
      );
    }

    if (!dbUser.total || !dbUser.documents[0].$id) {
      return c.json({ error: "Failed to initialize payment status" }, 500);
    }

    const billingUrl = `${BASE_URL}/pricing`;
    const dashboardUrl = `${BASE_URL}/dashboard`;

    const subscriptionPlan = await getUserSubscriptionPlan();

    if (subscriptionPlan.isSubscribed && dbUser.documents[0].stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.documents[0].stripeCustomerId,
        return_url: dashboardUrl,
      });

      return c.json({ url: stripeSession.url });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: `${dashboardUrl}?upgraded=1`,
      cancel_url: billingUrl,
      payment_method_types: ["card", "amazon_pay", "link"],
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
      subscription_data: {
        metadata: {
          userId: user.$id,
        },
      },
    });

    return c.json({ url: stripeSession.url });
  })
  .get("/:userId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const { userId } = c.req.param();

    if (!userId) {
      return c.json({
        data: {
          ...PLANS[0],
          isSubscribed: false,
          isCanceled: false,
          stripeCurrentPeriodEnd: null,
        },
      });
    }

    let dbUser = await databases.listDocuments<UserPaymentStatus>(
      DATABASE_ID,
      USER_PAYMENT_STATUS_ID,
      [Query.equal("userId", userId)],
    );

    const needsSync =
      !dbUser.total ||
      dbUser.documents[0].paymentStatus === PaymentStatus.Normal ||
      !dbUser.documents[0].stripePriceId;

    if (needsSync) {
      try {
        await syncSubscriptionFromStripe(userId, databases);
        dbUser = await databases.listDocuments<UserPaymentStatus>(
          DATABASE_ID,
          USER_PAYMENT_STATUS_ID,
          [Query.equal("userId", userId)],
        );
      } catch (error) {
        console.error("Subscription sync failed:", error);
      }
    }

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
        dbUser.documents[0].stripeCurrentPeriodEnd &&
        new Date(dbUser.documents[0].stripeCurrentPeriodEnd).getTime() +
          86_400_000 >
          Date.now(),
    );

    const plan = isSubscribed
      ? (PLANS.find(
          (plan) =>
            plan.price.priceIds.test === dbUser.documents[0].stripePriceId,
        ) ?? PLANS[1])
      : PLANS[0];

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
