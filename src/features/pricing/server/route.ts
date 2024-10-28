import { sessionMiddleware } from "@/lib/session-middleware";
import { Hono } from "hono";
import { PLANS } from "../libs/utils";
import { getUserSubscriptionPlan, stripe } from "./stripe";
import { PaymentStatus, UserPaymentStatus } from "../types";
import { DATABASE_ID, USER_PAYMENT_STATUS_ID } from "@/config";
import { Query } from "node-appwrite";
import Stripe from "stripe";

const app = new Hono()
  .post("/", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");

    const dbUser = await databases.listDocuments<UserPaymentStatus>(
      DATABASE_ID,
      USER_PAYMENT_STATUS_ID,
      [Query.equal("userId", user.$id)],
    );

    if (!dbUser.total || !dbUser.documents[0].$id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const billingUrl =
      process.env.NODE_ENV === "production"
        ? "http://task-flow-brown.vercel.app/pricing"
        : "http://localhost:3000/pricing";

    const subscriptionPlan = await getUserSubscriptionPlan();

    if (subscriptionPlan.isSubscribed && dbUser.documents[0].stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.documents[0].stripeCustomerId,
        return_url: billingUrl,
      });

      return c.json({ url: stripeSession.url });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card", "paypal"],
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          price: PLANS.find((plan) => plan.name === "Pro")?.price.priceIds.test,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.$id,
      },
    });

    return c.json({ url: stripeSession.url });
  })
  .post("/webhooks/stripe", sessionMiddleware, async (c) => {
    const body = await c.req.text();
    const signature = c.req.header("Stripe-Signature") ?? "";

    const databases = c.get("databases");

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
