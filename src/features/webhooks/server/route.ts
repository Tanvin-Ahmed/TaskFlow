import { stripe } from "@/features/pricing/server/stripe";
import { PaymentStatus } from "@/features/pricing/types";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { db } from "@/db";
import { userPaymentStatus } from "@/db/schema";
import { createId } from "@/lib/id";

async function upsertProStatus({
  userId,
  subscription,
}: {
  userId?: string;
  subscription: Stripe.Subscription;
}) {
  let existing = userId
    ? await db
        .select()
        .from(userPaymentStatus)
        .where(eq(userPaymentStatus.userId, userId))
        .limit(1)
    : await db
        .select()
        .from(userPaymentStatus)
        .where(eq(userPaymentStatus.stripeSubscriptionId, subscription.id))
        .limit(1);

  if (!existing.length && userId) {
    existing = await db
      .select()
      .from(userPaymentStatus)
      .where(eq(userPaymentStatus.stripeSubscriptionId, subscription.id))
      .limit(1);
  }

  const payload = {
    paymentStatus: PaymentStatus.Pro as const,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer as string,
    stripePriceId: subscription.items.data[0]?.price.id,
    stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    updatedAt: new Date(),
  };

  if (existing.length) {
    await db
      .update(userPaymentStatus)
      .set({
        ...payload,
        ...(userId ? { userId } : {}),
      })
      .where(eq(userPaymentStatus.id, existing[0].id));
    return;
  }

  if (!userId) {
    throw new Error("Cannot create payment status without userId");
  }

  await db.insert(userPaymentStatus).values({
    id: createId(),
    userId,
    ...payload,
  });
}

const app = new Hono().post("/stripe", async (c) => {
  const body = await c.req.text();
  const signature = c.req.header("Stripe-Signature") ?? "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch (err) {
    return c.text(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}`,
      400,
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (!userId) {
        return c.text("No userId found in session metadata", 400);
      }

      if (!session.subscription) {
        return c.text("No subscription on checkout session", 400);
      }

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
      );

      await upsertProStatus({ userId, subscription });
    }

    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      if (!invoice.subscription) {
        return c.text("Success", 200);
      }

      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string,
      );

      await upsertProStatus({
        userId: subscription.metadata?.userId,
        subscription,
      });
    }
  } catch (err) {
    console.error("Stripe webhook handler failed:", err);
    return c.text(
      `Webhook handler error: ${err instanceof Error ? err.message : "Unknown Error"}`,
      500,
    );
  }

  return c.text("Success", 200);
});

export default app;
