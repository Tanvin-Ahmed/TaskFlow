"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

const error = () => {
  return (
    <section className="flex h-screen w-full flex-col items-center justify-center gap-y-4">
      <AlertTriangle className="size-10 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Something went wrong</p>
      <Button variant={"secondary"} size={"sm"} asChild>
        <Link href={"/dashboard"}>Back to dashboard</Link>
      </Button>
    </section>
  );
};

export default error;
