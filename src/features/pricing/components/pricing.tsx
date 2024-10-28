import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PLANS, pricingItems } from "../libs/utils";
import { cn } from "@/lib/utils";
import { ArrowRightIcon, Check, HelpCircle, Minus } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import UpgradeButton from "./upgrade-button";
import { getCurrent } from "@/features/auth/server/queries";

const Pricing = async () => {
  const user = await getCurrent();

  return (
    <div className="mb-8 mt-24 text-center">
      <div className="mx-auto mb-10 max-w-lg">
        <h1 className="text-6xl font-bold sm:text-7xl">Pricing</h1>
        <p className="mt-5 text-gray-600 sm:text-lg">
          Whether you&apos;re just trying out our service or need more,
          we&apos;ve got your covered.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-10 pt-12 lg:grid-cols-2">
        <TooltipProvider>
          {pricingItems.map((item) => {
            const price =
              PLANS.find((plan) => plan.slug === item.plan.toLowerCase())?.price
                .amount || 0;

            return (
              <div
                key={item.plan}
                className={cn(
                  "relative rounded-2xl bg-white shadow-lg dark:bg-purple-900/20",
                  {
                    "border-2 border-purple-600 shadow-purple-200":
                      item.plan === "Pro",
                    "border border-gray-200": item.plan !== "Pro",
                  },
                )}
              >
                {item.plan === "Pro" && (
                  <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 px-3 py-2 text-sm font-medium text-white">
                    Upgrade now
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-display my-3 text-center text-3xl font-bold">
                    {item.plan}
                  </h3>
                  <p className="text-gray-500">{item.tagline}</p>
                  <p className="font-display my-5 text-6xl font-semibold">
                    {price}
                  </p>
                  <p className="text-gray-500">per month</p>
                </div>

                <div className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-gray-50 dark:bg-purple-900/40">
                  <div className="flex items-center space-x-1">
                    <p> PDF/mo included</p>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger className="ml-1.5 cursor-default">
                        <HelpCircle className="h-4 w-4 text-zinc-500" />
                      </TooltipTrigger>
                      <TooltipContent className="w-80 p-2">
                        How many PDFs you upload per month.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <ul className="my-10 space-y-5 px-8">
                  {item.features.map((feature) => (
                    <li key={feature.text} className="flex space-x-5">
                      <div className="flex-shrink-0">
                        {feature.negative ? (
                          <Minus className="h-6 w-6 text-gray-300" />
                        ) : (
                          <Check className="h-6 w-6 text-blue-500" />
                        )}
                      </div>
                      {feature.footnote ? (
                        <div className="flex items-center space-x-1">
                          <p
                            className={cn("text-gray-400", {
                              "text-gray-600": feature.negative,
                            })}
                          >
                            {feature.text}
                          </p>
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger className="ml-1.5 cursor-default">
                              <HelpCircle className="h-4 w-4 text-zinc-500" />
                            </TooltipTrigger>
                            <TooltipContent className="w-80 p-2">
                              {feature.footnote}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      ) : (
                        <p
                          className={cn("text-gray-400", {
                            "text-gray-600": feature.negative,
                          })}
                        >
                          {feature.text}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="border-t border-gray-200" />
                <div className="p-5">
                  {item.plan === "Free" ? (
                    <Link
                      href={user ? "/dashboard" : "/sign-in"}
                      className={buttonVariants({
                        className: "w-full",
                        variant: "secondary",
                      })}
                    >
                      {user ? "Upgrade now" : "Sign up"}
                      <ArrowRightIcon className="ml-1.5 h-5 w-5" />
                    </Link>
                  ) : user ? (
                    <UpgradeButton />
                  ) : (
                    <Link
                      href={"/sign-in"}
                      className={buttonVariants({
                        className: "w-full",
                      })}
                    >
                      {user ? "Upgrade now" : "Sign up"}
                      <ArrowRightIcon className="ml-1.5 h-5 w-5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
};

export default Pricing;
