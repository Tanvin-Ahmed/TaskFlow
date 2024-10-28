import { DATABASE_ID, USER_PAYMENT_STATUS_ID } from "@/config";
import { stripe } from "@/features/pricing/server/stripe";
import { PaymentStatus } from "@/features/pricing/types";
import { createAdminClient } from "@/lib/appwrite";
import { Hono } from "hono";
import { Query } from "node-appwrite";
import Stripe from "stripe";

const app = new Hono().post("/stripe", async (c) => {
  const body = await c.req.text();
  const signature = c.req.header("stripe-signature") ?? "";

  const { databases } = await createAdminClient();

  let event;

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

  const session = event.data.object as Stripe.Checkout.Session;

  if (!session?.metadata?.userId) {
    return c.text("No userId found in session", 200);
  }

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    const existingPayment = await databases.listDocuments(
      DATABASE_ID,
      USER_PAYMENT_STATUS_ID,
      [Query.equal("userId", session.metadata?.userId)],
    );

    await databases.updateDocument(
      DATABASE_ID,
      USER_PAYMENT_STATUS_ID,
      existingPayment.documents[0].$id,
      {
        paymentStatus: PaymentStatus.Pro,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000,
        ),
      },
    );
  }

  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    const info = await databases.listDocuments(
      DATABASE_ID,
      USER_PAYMENT_STATUS_ID,
      [Query.equal("stripeSubscriptionId", subscription.id)],
    );

    await databases.updateDocument(
      DATABASE_ID,
      USER_PAYMENT_STATUS_ID,
      info.documents[0].$id,
      {
        paymentStatus: PaymentStatus.Pro,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000,
        ),
      },
    );
  }

  return c.text("Success", 200);
});

export default app;
