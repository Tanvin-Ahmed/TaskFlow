"use client";
import { cn } from "@/lib/utils";
import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

interface Props {
  id: number;
  title: string;
  description: string;
  Icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  className: string;
  handleClick?: () => void;
}

const HomeCard = ({
  title,
  Icon,
  description,
  className,
  handleClick,
}: Props) => {
  return (
    <div
      className={cn(
        "flex min-h-[260px] w-full cursor-pointer flex-col justify-between rounded-[14px] px-4 py-6 text-white xl:max-w-[270px]",
        className,
      )}
      onClick={() => handleClick?.()}
    >
      <div className="glassmorphism flex size-12 items-center justify-center rounded-[10px]">
        <Icon className="size-7" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm font-normal sm:text-lg">{description}</p>
      </div>
    </div>
  );
};

export default HomeCard;
