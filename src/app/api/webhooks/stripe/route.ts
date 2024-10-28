import { DATABASE_ID, USER_PAYMENT_STATUS_ID } from "@/config";
import { stripe } from "@/features/pricing/server/stripe";
import { PaymentStatus } from "@/features/pricing/types";
import { createSessionClient } from "@/lib/appwrite";
import { headers } from "next/headers";
import { Query } from "node-appwrite";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("Stripe-Signature") ?? "";

  // initialize database
  const { databases } = await createSessionClient();
  if (!databases) return;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch (err) {
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown Error"}`,
      { status: 400 },
    );
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (!session?.metadata?.userId) {
    return new Response(null, {
      status: 200,
    });
  }

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    // await db.user.update({
    //   where: {
    //     id: session.metadata.userId,
    //   },
    //   data: {
    //     stripeSubscriptionId: subscription.id,
    //     stripeCustomerId: subscription.customer as string,
    //     stripePriceId: subscription.items.data[0]?.price.id,
    //     stripeCurrentPeriodEnd: new Date(
    //       subscription.current_period_end * 1000
    //     ),
    //   },
    // });

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

  // when renew the subscription plan
  if (event.type === "invoice.payment_succeeded") {
    // Retrieve the subscription details from Stripe.
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    // await db.user.update({
    //   where: {
    //     stripeSubscriptionId: subscription.id,
    //   },
    //   data: {
    //     stripePriceId: subscription.items.data[0]?.price.id,
    //     stripeCurrentPeriodEnd: new Date(
    //       subscription.current_period_end * 1000
    //     ),
    //   },
    // });

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

  return new Response(null, { status: 200 });
}
