export enum PaymentStatus {
  Pro = "Pro",
  Normal = "Normal",
}

export type UserPaymentStatus = {
  $id: string;
  userId: string;
  paymentStatus: PaymentStatus;
  stripePriceId?: string | null;
  stripeCurrentPeriodEnd?: Date | string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  $createdAt?: string;
  $updatedAt?: string;
};
