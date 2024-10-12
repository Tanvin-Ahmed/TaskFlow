"use client";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

import CustomAvatar from "./custom-avatar";
import Link from "next/link";
import { ThemeToggle } from "./theme-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 w-full shadow-md backdrop-blur-sm dark:bg-indigo-900/20">
      <nav
        className={cn(
          "mx-auto flex max-w-screen-2xl items-center justify-between p-4",
        )}
      >
        <Link href={"/"} className="flex items-center gap-2">
          <CustomAvatar src="/assets/icons/logo.png" alt="TF" />
          <h1 className="text-xl font-bold sm:text-2xl">
            <span className="text-primary">Task</span> Flow
          </h1>
        </Link>

        <div className="flex items-center justify-center gap-3">
          {/* for large screen */}
          <div className="hidden items-center justify-center gap-2 sm:flex">
            {pathname === "/sign-up" ? (
              <Link href={"/sign-in"}>
                <Button>Sign In</Button>
              </Link>
            ) : (
              <Link href={"/sign-up"}>
                <Button>Sing Up</Button>
              </Link>
            )}

            <ThemeToggle />
          </div>
          {/* for small device */}
          <div className="block sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Menu />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuGroup>
                  {pathname === "/sign-up" ? (
                    <DropdownMenuItem>
                      <Link href={"/sign-in"} className="w-full">
                        <Button className="w-full">Sign In</Button>
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem>
                      <Link href={"/sign-up"} className="w-full">
                        <Button className="w-full">Sing Up</Button>
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <ThemeToggle className="w-full" />
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
