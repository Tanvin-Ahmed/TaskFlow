"use client";
import ResponsiveModal from "@/components/custom/dashboard/responsive-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ReactNode } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children?: ReactNode;
  handleClick?: () => void;
  buttonText?: string;
  image?: string;
  buttonIcon?: string;
}

const MeetingModal = ({
  isOpen,
  onClose,
  image,
  title,
  className,
  children,
  buttonText,
  handleClick,
  buttonIcon,
}: Props) => {
  return (
    <ResponsiveModal open={isOpen} onOpenChange={onClose}>
      <div className="flex flex-col gap-6 p-5">
        {image ? (
          <div className="flex justify-center">
            <Image src={image} alt="image" width={72} height={72} />
          </div>
        ) : null}
        <h1 className={cn("text-3xl font-bold leading-[42px]", className)}>
          {title}
        </h1>
        {children ?? null}
        <Button onClick={handleClick}>
          {buttonIcon ? (
            <Image src={buttonIcon} alt="icon" width={13} height={13} />
          ) : null}{" "}
          {buttonText || "Schedule Meeting"}
        </Button>
      </div>
    </ResponsiveModal>
  );
};

export default MeetingModal;
