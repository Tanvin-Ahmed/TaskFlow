import { DATABASE_ID, USER_PAYMENT_STATUS_ID } from "@/config";
import { createAdminClient } from "@/lib/appwrite";
import { Databases, ID, Query } from "node-appwrite";
import Stripe from "stripe";
import { PaymentStatus } from "../types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-10-28.acacia",
  typescript: true,
});

/**
 * Recover Pro status when Stripe checkout succeeded but the webhook
 * failed to update Appwrite (common in local/dev).
 *
 * Prefer passing the authenticated user `databases` client so updates work
 * even when the API key is missing documents.read/write scopes.
 */
export async function syncSubscriptionFromStripe(
  userId: string,
  databases?: Databases,
) {
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

  const db =
    databases ?? (await createAdminClient()).databases;

  const existing = await db.listDocuments(
    DATABASE_ID,
    USER_PAYMENT_STATUS_ID,
    [Query.equal("userId", userId)],
  );

  const payload = {
    userId,
    paymentStatus: PaymentStatus.Pro,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer as string,
    stripePriceId: subscription.items.data[0]?.price.id,
    stripeCurrentPeriodEnd: new Date(
      subscription.current_period_end * 1000,
    ).toISOString(),
  };

  if (existing.total) {
    await db.updateDocument(
      DATABASE_ID,
      USER_PAYMENT_STATUS_ID,
      existing.documents[0].$id,
      payload,
    );
  } else {
    await db.createDocument(
      DATABASE_ID,
      USER_PAYMENT_STATUS_ID,
      ID.unique(),
      payload,
    );
  }

  return true;
}
