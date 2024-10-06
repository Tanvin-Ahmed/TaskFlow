"use client";
import { ChevronsLeft } from "lucide-react";
import { Button } from "../../ui/button";
import CustomAvatar from "./custom-avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { sidebarData } from "@/constant/data";
import { usePathname } from "next/navigation";
import useSidebar from "@/hooks/use-sidebar";

const Sidebar = () => {
  const {
    openSidebar,
    handleCloseSidebar,
    openFullSidebar,
    toggleOpenFullSidebar,
  } = useSidebar();
  const pathname = usePathname();

  return (
    <>
      <div
        onClick={handleCloseSidebar}
        className={cn("duration-300 sm:hidden", {
          "fixed inset-0 z-50 bg-indigo-900 bg-opacity-30": openSidebar,
          hidden: !openSidebar,
        })}
      />

      <nav
        className={cn(
          "relative hidden min-h-screen bg-[#f1ecff] p-5 pt-8 shadow-xl backdrop-blur-sm duration-300 dark:bg-transparent dark:shadow-lg dark:shadow-indigo-900 sm:block",
          {
            "w-64": openFullSidebar,
            "w-20": !openFullSidebar,
            "-translate-x-96 transform sm:translate-x-0": !openSidebar,
            "translate-x-0 transform": openFullSidebar,
            "fixed bottom-0 left-0 top-0 z-50 block translate-x-0 transform overflow-y-auto duration-300 sm:relative":
              openSidebar,
            "fixed bottom-0 left-0 top-0 z-50 block -translate-x-[100%] transform duration-300 sm:relative":
              !openSidebar,
          },
        )}
      >
        {/* arrow button */}
        <Button
          size={"icon"}
          className="absolute -right-2.5 top-24 hidden h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-primary sm:flex"
          onClick={toggleOpenFullSidebar}
        >
          <ChevronsLeft
            className={cn("h-4 w-4 duration-300", {
              "rotate-180": !openFullSidebar,
            })}
          />
        </Button>

        {/* brand */}
        <Link
          href={"/"}
          className="flex items-center gap-2"
          onClick={handleCloseSidebar}
        >
          <CustomAvatar src="/assets/icons/logo.png" alt="TF" />
          <h1
            className={cn("text-nowrap text-xl font-bold sm:text-2xl", {
              "scale-0": !openFullSidebar,
              "scale-1 duration-300": openFullSidebar,
            })}
          >
            <span className="text-primary">Task</span> Flow
          </h1>
        </Link>

        {/* quick link */}
        <div className="my-14">
          <h4
            className={cn("mb-5 text-nowrap font-bold", {
              "scale-0": !openFullSidebar,
              "scale-1 duration-300": openFullSidebar,
            })}
          >
            Quick Link
          </h4>
          <div className="space-y-4">
            {sidebarData.quickLink.map((option) => (
              <Link key={option.id} href={option.link} className="block w-full">
                <Button
                  variant={pathname === option.link ? "default" : "outline"}
                  className={cn("w-full", {
                    "flex items-center justify-start gap-3": openFullSidebar,
                  })}
                  size={openFullSidebar ? "default" : "icon"}
                  onClick={handleCloseSidebar}
                >
                  <option.Icon />
                  <span
                    className={cn("text-nowrap duration-300", {
                      "hidden scale-0": !openFullSidebar,
                      "scale-1": openFullSidebar,
                    })}
                  >
                    {option.label}
                  </span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
