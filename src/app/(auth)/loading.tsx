"use client";
import { Loader } from "lucide-react";

const error = () => {
  return (
    <section className="flex h-screen w-full flex-col items-center justify-center">
      <Loader className="size-10 animate-spin text-muted-foreground" />
    </section>
  );
};

export default error;
