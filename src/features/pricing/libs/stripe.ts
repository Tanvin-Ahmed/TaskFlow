import Stripe from "stripe";
import { PLANS } from "./utils";
import { getCurrent } from "@/features/auth/server/queries";
import { Models } from "node-appwrite";
import { UserPaymentStatus } from "../types";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-09-30.acacia",
  typescript: true,
});

export async function getUserSubscriptionPlan(
  dbUser: Models.DocumentList<UserPaymentStatus>,
) {
  const user = await getCurrent();

  if (!user?.$id) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  if (!dbUser.total) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
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

  return {
    ...plan,
    stripeSubscriptionId: dbUser.documents[0].stripeSubscriptionId,
    stripeCurrentPeriodEnd: dbUser.documents[0].stripeCurrentPeriodEnd,
    stripeCustomerId: dbUser.documents[0].stripeCustomerId,
    isSubscribed,
    isCanceled,
  };
}
