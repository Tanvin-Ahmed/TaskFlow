import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { db } from "@/db";
import { userPaymentStatus } from "@/db/schema";
import { createId } from "@/lib/id";
import { PaymentStatus } from "../types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-10-28.acacia",
  typescript: true,
});

/**
 * Recover Pro status when Stripe checkout succeeded but the webhook
 * failed to update the database (common in local/dev).
 */
export async function syncSubscriptionFromStripe(userId: string) {
  const sessions = await stripe.checkout.sessions.list({
    limit: 30,
  });

  const completed = sessions.data.find(
    (session) =>
      session.mode === "subscription" &&
      session.status === "complete" &&
      session.metadata?.userId === userId &&
      !!session.subscription,
  );

  if (!completed?.subscription) {
    return false;
  }

  const subscription = await stripe.subscriptions.retrieve(
    completed.subscription as string,
  );

  if (subscription.status !== "active" && subscription.status !== "trialing") {
    return false;
  }

  const existing = await db
    .select()
    .from(userPaymentStatus)
    .where(eq(userPaymentStatus.userId, userId))
    .limit(1);

  const payload = {
    userId,
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
      .set(payload)
      .where(eq(userPaymentStatus.id, existing[0].id));
  } else {
    await db.insert(userPaymentStatus).values({
      id: createId(),
      ...payload,
    });
  }

  return true;
}
