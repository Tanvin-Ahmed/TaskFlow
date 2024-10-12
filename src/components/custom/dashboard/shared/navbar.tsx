"use client";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../../shared/theme-button";
import MenuButton from "./menu-button";

const DashboardNavbar = () => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#f1ecff] dark:bg-indigo-900/20 dark:backdrop-blur-sm">
      <nav
        className={cn("container mx-auto flex items-center justify-end p-2")}
      >
        <div className="flex items-center justify-center gap-3">
          {/* for large screen */}
          <div className="flex items-center justify-center gap-2">
            <ThemeToggle />
            <MenuButton />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default DashboardNavbar;
