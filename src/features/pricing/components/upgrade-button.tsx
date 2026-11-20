"use client";

import { ArrowRight, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateStripeSession } from "../api/use-create-stripe-session";

interface Props {
  isSubscribed?: boolean;
}

const UpgradeButton = ({ isSubscribed = false }: Props) => {
  const { mutate, isPending } = useCreateStripeSession();

  const createStripeSession = () => {
    mutate(
      {},
      {
        onSuccess: ({ url }) => {
          window.location.href = url ?? "/pricing";
        },
      },
    );
  };

  return (
    <Button
      className="w-full"
      onClick={() => createStripeSession()}
      disabled={isPending}
    >
      {isPending ? (
        <Loader className="size-4 animate-spin" />
      ) : (
        <>
          {isSubscribed ? "Manage subscription" : "Upgrade now"}{" "}
          <ArrowRight className="ml-1.5 h-5 w-5" />
        </>
      )}
    </Button>
  );
};

export default UpgradeButton;
