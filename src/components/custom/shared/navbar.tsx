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
import { usePathname, useSearchParams } from "next/navigation";
import { useCurrent } from "@/features/auth/api/use-current";
import UserButton from "@/features/auth/components/user-button";

const Navbar = () => {
  const { data: user } = useCurrent();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const authQuery =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? `?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "";
  const signInHref = `/sign-in${authQuery}`;
  const signUpHref = `/sign-up${authQuery}`;

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
            {user ? (
              <>
                <UserButton />
              </>
            ) : pathname === "/sign-up" ? (
              <Link href={signInHref}>
                <Button>Sign In</Button>
              </Link>
            ) : (
              <Link href={signUpHref}>
                <Button>Sign Up</Button>
              </Link>
            )}

            <ThemeToggle />
          </div>
          {/* for small device */}
          <div className="flex items-center justify-between gap-2 sm:hidden">
            {user ? (
              <>
                <UserButton />
                <ThemeToggle className="w-full" />
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Menu />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuGroup>
                    {user ? null : pathname === "/sign-up" ? (
                      <DropdownMenuItem>
                        <Link href={signInHref} className="w-full">
                          <Button className="w-full">Sign In</Button>
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem>
                        <Link href={signUpHref} className="w-full">
                          <Button className="w-full">Sign Up</Button>
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
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
