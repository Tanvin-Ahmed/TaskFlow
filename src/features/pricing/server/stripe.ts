import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { PLANS } from "../libs/utils";
import { getCurrent } from "@/features/auth/server/queries";
import { UserPaymentStatus } from "../types";
import { db } from "@/db";
import { userPaymentStatus } from "@/db/schema";
import { toDocument } from "@/db/mappers";
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
    ? (PLANS.find((p) => p.price.priceIds.test === doc.stripePriceId) ??
      PLANS[1])
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

  let rows = await db
    .select()
    .from(userPaymentStatus)
    .where(eq(userPaymentStatus.userId, user.$id))
    .limit(1);

  let doc = rows[0]
    ? (toDocument(rows[0]) as unknown as UserPaymentStatus)
    : undefined;
  let { isSubscribed } = doc
    ? buildPlanResponse(doc)
    : { isSubscribed: false };

  if (!isSubscribed) {
    try {
      const synced = await syncSubscriptionFromStripe(user.$id);
      if (synced) {
        rows = await db
          .select()
          .from(userPaymentStatus)
          .where(eq(userPaymentStatus.userId, user.$id))
          .limit(1);
        doc = rows[0]
          ? (toDocument(rows[0]) as unknown as UserPaymentStatus)
          : undefined;
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
