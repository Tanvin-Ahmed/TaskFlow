"use client";
import ResponsiveModal from "@/components/custom/dashboard/responsive-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideProps } from "lucide-react";
import Image from "next/image";
import { ForwardRefExoticComponent, ReactNode, RefAttributes } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children?: ReactNode;
  handleClick?: () => void;
  buttonText?: string;
  image?: string;
  ButtonIcon?:
    | string
    | ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
      >;
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
  ButtonIcon,
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
        <Button
          onClick={handleClick}
          disabled={typeof ButtonIcon !== "string" && ButtonIcon !== undefined}
        >
          {typeof ButtonIcon === "string" ? (
            <Image src={ButtonIcon} alt="icon" width={14} height={14} />
          ) : ButtonIcon !== undefined ? (
            <ButtonIcon className="size-3 animate-spin text-muted-foreground" />
          ) : null}{" "}
          &nbsp;
          {buttonText || "Schedule Meeting"}
        </Button>
      </div>
    </ResponsiveModal>
  );
};

export default MeetingModal;
