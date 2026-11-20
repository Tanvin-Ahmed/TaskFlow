"use client";

import { useCallback, useEffect, useState, type ComponentProps } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { PartyPopper, Sparkles } from "lucide-react";
import type ReactConfetti from "react-confetti";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCurrent } from "@/features/auth/api/use-current";
import { client } from "@/lib/rpc";

type ConfettiProps = ComponentProps<typeof ReactConfetti>;

const Confetti = dynamic<ConfettiProps>(
  () =>
    import("react-confetti").then((mod) => ({
      default: (mod.default ?? mod) as typeof ReactConfetti,
    })),
  { ssr: false },
);

const ProCongratsModal = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: user } = useCurrent();

  const shouldShow = searchParams.get("upgraded") === "1";
  const [open, setOpen] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (!shouldShow) return;

    setOpen(true);

    const sync = async () => {
      if (!user?.$id) return;

      try {
        await client.api.pricing[":userId"].$get({
          param: { userId: user.$id },
        });
      } catch {
        // Checkout already succeeded; sync errors are non-blocking here.
      } finally {
        queryClient.invalidateQueries({
          queryKey: ["subscription", user.$id],
        });
        router.refresh();
      }
    };

    void sync();
  }, [shouldShow, queryClient, router, user?.$id]);

  const clearUpgradedParam = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("upgraded");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [pathname, router, searchParams]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      clearUpgradedParam();
    }
  };

  if (!shouldShow && !open) return null;

  return (
    <>
      {open && windowSize.width > 0 ? (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={280}
          recycle={false}
          gravity={0.18}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            pointerEvents: "none",
          }}
        />
      ) : null}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md overflow-hidden border-purple-200 dark:border-purple-800">
          <DialogHeader className="items-center text-center sm:text-center">
            <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300">
              <PartyPopper className="size-7" />
            </div>
            <DialogTitle className="text-2xl">Congratulations!</DialogTitle>
            <DialogDescription className="text-base">
              Your Pro plan is active. Enjoy unlimited projects, members, and
              meetings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              className="w-full sm:w-auto"
              onClick={() => handleOpenChange(false)}
            >
              <Sparkles className="mr-2 size-4" />
              Start exploring
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProCongratsModal;
