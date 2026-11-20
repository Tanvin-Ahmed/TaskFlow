import Stripe from "stripe";
import { PLANS } from "../libs/utils";
import { getCurrent } from "@/features/auth/server/queries";
import { Query } from "node-appwrite";
import { UserPaymentStatus } from "../types";
import { createSessionClient } from "@/lib/appwrite";
import { DATABASE_ID, USER_PAYMENT_STATUS_ID } from "@/config";
import { syncSubscriptionFromStripe } from "./sync-subscription";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-10-28.acacia",
  typescript: true,
});

function buildPlanResponse(doc: UserPaymentStatus) {
  const isSubscribed = Boolean(
    doc.stripePriceId &&
      doc.stripeCurrentPeriodEnd &&
      new Date(doc.stripeCurrentPeriodEnd).getTime() + 86_400_000 > Date.now(),
  );

  const plan = isSubscribed
    ? PLANS.find((p) => p.price.priceIds.test === doc.stripePriceId) ??
      PLANS[1]
    : PLANS[0];

  return {
    plan,
    isSubscribed,
  };
}

export async function getUserSubscriptionPlan() {
  const user = await getCurrent();

  if (!user?.$id) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  const { databases } = await createSessionClient();
  let dbUser = await databases.listDocuments<UserPaymentStatus>(
    DATABASE_ID,
    USER_PAYMENT_STATUS_ID,
    [Query.equal("userId", user.$id)],
  );

  let doc = dbUser.documents[0];
  let { isSubscribed } = doc
    ? buildPlanResponse(doc)
    : { isSubscribed: false };

  // Heal missed webhooks (e.g. local Stripe checkout without forwarding).
  // Use the user session DB client so this works without API key document scopes.
  if (!isSubscribed) {
    try {
      const synced = await syncSubscriptionFromStripe(user.$id, databases);
      if (synced) {
        dbUser = await databases.listDocuments<UserPaymentStatus>(
          DATABASE_ID,
          USER_PAYMENT_STATUS_ID,
          [Query.equal("userId", user.$id)],
        );
        doc = dbUser.documents[0];
      }
    } catch (error) {
      console.error("Failed to sync subscription from Stripe:", error);
    }
  }

  if (!doc) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  const resolved = buildPlanResponse(doc);
  isSubscribed = resolved.isSubscribed;

  let isCanceled = false;
  if (isSubscribed && doc.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(
      doc.stripeSubscriptionId,
    );
    isCanceled = stripePlan.cancel_at_period_end;
  }

  return {
    ...resolved.plan,
    stripeSubscriptionId: doc.stripeSubscriptionId,
    stripeCurrentPeriodEnd: doc.stripeCurrentPeriodEnd,
    stripeCustomerId: doc.stripeCustomerId,
    isSubscribed,
    isCanceled,
  };
}
