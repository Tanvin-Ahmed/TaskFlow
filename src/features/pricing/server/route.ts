import { sessionMiddleware } from "@/lib/session-middleware";
import { BASE_URL } from "@/config";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { PaymentStatus } from "../types";
import { PLANS } from "../libs/utils";
import { getUserSubscriptionPlan, stripe } from "./stripe";
import { syncSubscriptionFromStripe } from "./sync-subscription";
import { db } from "@/db";
import { userPaymentStatus } from "@/db/schema";
import { createId } from "@/lib/id";

const app = new Hono()
  .post("/", sessionMiddleware, async (c) => {
    const user = c.get("user");

    try {
      await syncSubscriptionFromStripe(user.$id);
    } catch (error) {
      console.error("Pre-checkout subscription sync failed:", error);
    }

    let rows = await db
      .select()
      .from(userPaymentStatus)
      .where(eq(userPaymentStatus.userId, user.$id))
      .limit(1);

    if (!rows.length) {
      await db.insert(userPaymentStatus).values({
        id: createId(),
        userId: user.$id,
        paymentStatus: PaymentStatus.Normal,
      });

      rows = await db
        .select()
        .from(userPaymentStatus)
        .where(eq(userPaymentStatus.userId, user.$id))
        .limit(1);
    }

    if (!rows.length) {
      return c.json({ error: "Failed to initialize payment status" }, 500);
    }

    const billingUrl = `${BASE_URL}/pricing`;
    const dashboardUrl = `${BASE_URL}/dashboard`;
    const subscriptionPlan = await getUserSubscriptionPlan();

    if (subscriptionPlan.isSubscribed && rows[0].stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: rows[0].stripeCustomerId,
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

    let rows = await db
      .select()
      .from(userPaymentStatus)
      .where(eq(userPaymentStatus.userId, userId))
      .limit(1);

    const needsSync =
      !rows.length ||
      rows[0].paymentStatus === PaymentStatus.Normal ||
      !rows[0].stripePriceId;

    if (needsSync) {
      try {
        await syncSubscriptionFromStripe(userId);
        rows = await db
          .select()
          .from(userPaymentStatus)
          .where(eq(userPaymentStatus.userId, userId))
          .limit(1);
      } catch (error) {
        console.error("Subscription sync failed:", error);
      }
    }

    if (!rows.length) {
      return c.json({
        data: {
          ...PLANS[0],
          isSubscribed: false,
          isCanceled: false,
          stripeCurrentPeriodEnd: null,
        },
      });
    }

    const paymentDoc = rows[0];

    if (
      paymentDoc.paymentStatus === PaymentStatus.Normal ||
      !paymentDoc.stripePriceId
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
      paymentDoc.stripePriceId &&
        paymentDoc.stripeCurrentPeriodEnd &&
        new Date(paymentDoc.stripeCurrentPeriodEnd).getTime() + 86_400_000 >
          Date.now(),
    );

    const plan = isSubscribed
      ? (PLANS.find(
          (p) => p.price.priceIds.test === paymentDoc.stripePriceId,
        ) ?? PLANS[1])
      : PLANS[0];

    let isCanceled = false;
    if (isSubscribed && paymentDoc.stripeSubscriptionId) {
      const stripePlan = await stripe.subscriptions.retrieve(
        paymentDoc.stripeSubscriptionId,
      );
      isCanceled = stripePlan.cancel_at_period_end;
    }

    return c.json({
      data: {
        ...plan,
        stripeSubscriptionId: paymentDoc.stripeSubscriptionId,
        stripeCurrentPeriodEnd: paymentDoc.stripeCurrentPeriodEnd,
        stripeCustomerId: paymentDoc.stripeCustomerId,
        isSubscribed,
        isCanceled,
      },
    });
  });

export default app;
