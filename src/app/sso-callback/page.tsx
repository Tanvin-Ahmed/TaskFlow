"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Loader } from "lucide-react";

export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Loader className="size-8 animate-spin text-muted-foreground" />
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
