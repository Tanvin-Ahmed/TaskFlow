import { DATABASE_ID, USER_PAYMENT_STATUS_ID } from "@/config";
import { stripe } from "@/features/pricing/server/stripe";
import { PaymentStatus } from "@/features/pricing/types";
import { createAdminClient } from "@/lib/appwrite";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import Stripe from "stripe";

async function upsertProStatus({
  userId,
  subscription,
}: {
  userId?: string;
  subscription: Stripe.Subscription;
}) {
  const { databases } = await createAdminClient();

  let existing = userId
    ? await databases.listDocuments(DATABASE_ID, USER_PAYMENT_STATUS_ID, [
        Query.equal("userId", userId),
      ])
    : await databases.listDocuments(DATABASE_ID, USER_PAYMENT_STATUS_ID, [
        Query.equal("stripeSubscriptionId", subscription.id),
      ]);

  // Fallback: find by subscription id if userId lookup missed.
  if (!existing.total && userId) {
    existing = await databases.listDocuments(
      DATABASE_ID,
      USER_PAYMENT_STATUS_ID,
      [Query.equal("stripeSubscriptionId", subscription.id)],
    );
  }

  const payload = {
    paymentStatus: PaymentStatus.Pro,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer as string,
    stripePriceId: subscription.items.data[0]?.price.id,
    stripeCurrentPeriodEnd: new Date(
      subscription.current_period_end * 1000,
    ).toISOString(),
  };

  if (existing.total) {
    await databases.updateDocument(
      DATABASE_ID,
      USER_PAYMENT_STATUS_ID,
      existing.documents[0].$id,
      {
        ...payload,
        ...(userId ? { userId } : {}),
      },
    );
    return;
  }

  if (!userId) {
    throw new Error("Cannot create payment status without userId");
  }

  await databases.createDocument(
    DATABASE_ID,
    USER_PAYMENT_STATUS_ID,
    ID.unique(),
    {
      userId,
      ...payload,
    },
  );
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
