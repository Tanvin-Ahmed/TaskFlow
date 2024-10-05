"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

import CustomAvatar from "./custom-avatar";
import { useAuth, UserButton } from "@clerk/nextjs";
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

const Navbar = () => {
  const { userId } = useAuth();
  return (
    <header className="sticky top-0 z-50 w-full bg-[#f1ecff] dark:bg-indigo-900/20 dark:backdrop-blur-sm">
      <nav className="container mx-auto flex items-center justify-between p-2">
        <Link href={"/"} className="flex items-center gap-2">
          <CustomAvatar src="./assets/icons/logo.png" alt="TF" />
          <h1 className="text-xl font-bold sm:text-2xl">
            <span className="text-primary">Task</span> Flow
          </h1>
        </Link>
        <div className="flex items-center justify-center gap-3">
          {userId ? <UserButton /> : null}
          {/* for large screen */}
          <div className="hidden items-center justify-center gap-2 sm:flex">
            {userId ? (
              <Link href={"/snippets"}>
                <Button>My Snippets</Button>
              </Link>
            ) : (
              <>
                <Link href={"/sign-in"}>
                  <Button>Sign In</Button>
                </Link>

                <Link href={"/sign-up"}>
                  <Button variant={"outline"}>Sing Up</Button>
                </Link>
              </>
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
                  {userId ? (
                    <DropdownMenuItem>
                      <Link href={"/snippets"} className="w-full">
                        <Button className="w-full">My Snippets</Button>
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem>
                        <Link href={"/sign-in"} className="w-full">
                          <Button className="w-full">Sign In</Button>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href={"/sign-up"} className="w-full">
                          <Button className="w-full" variant={"outline"}>
                            Sing Up
                          </Button>
                        </Link>
                      </DropdownMenuItem>
                    </>
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
