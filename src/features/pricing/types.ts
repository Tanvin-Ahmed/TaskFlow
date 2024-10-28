import { Models } from "node-appwrite";

export enum PaymentStatus {
  Pro = "Pro",
  Normal = "Normal",
}

export type UserPaymentStatus = Models.Document & {
  userId: string;
  paymentStatus: PaymentStatus;
  stripePriceId?: string;
  stripeCurrentPeriodEnd?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
};
