import ResponsiveModal from "@/components/custom/dashboard/responsive-modal";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";

const useConfirm = (
  title: string,
  message: string,
  variant: ButtonProps["variant"] = "default",
) => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () => {
    return new Promise((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmationDialog = () => {
    return (
      <ResponsiveModal open={promise !== null} onOpenChange={handleClose}>
        <Card className="h-full w-full border-none shadow-none">
          <CardContent className="p-8">
            <CardHeader className="p-0">
              <CardTitle>{title}</CardTitle>
              <CardDescription>{message}</CardDescription>
            </CardHeader>
            <div className="flex w-full flex-col items-center justify-end gap-x-2 gap-y-2 pt-4 lg:flex-row">
              <Button
                onClick={handleCancel}
                variant={"outline"}
                type="button"
                className="w-full lg:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                variant={variant}
                type="button"
                className="w-full lg:w-auto"
              >
                Confirm
              </Button>
            </div>
          </CardContent>
        </Card>
      </ResponsiveModal>
    );
  };

  return { ConfirmationDialog, confirm };
};

export default useConfirm;
