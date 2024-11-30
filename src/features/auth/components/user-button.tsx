"use client";
import { useCurrent } from "../api/use-current";
import { LayoutDashboard, Loader, LogOut } from "lucide-react";
import CustomAvatar from "@/components/custom/shared/custom-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DottedSeparator from "@/components/custom/shared/dotted-separator";
import { useLogout } from "../api/use-logout";
import Link from "next/link";

const UserButton = () => {
  const { data: user, isLoading } = useCurrent();
  const { mutate: logout } = useLogout();

  if (isLoading) {
    return (
      <div className="flex size-8 items-center justify-center rounded-full border border-neutral-300 bg-neutral-200">
        <Loader className="size-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const avatarFallback = user?.name
    ? user.name.charAt(0)?.toUpperCase()
    : (user.email.charAt(0)?.toUpperCase() ?? "U");

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="relative outline-none">
        <CustomAvatar
          src=""
          alt={avatarFallback}
          className="size-8 border border-neutral-300 transition hover:opacity-75 dark:border-purple-300"
          fallbackClassName="bg-neutral-200 dark:bg-purple-900/40 font-medium text-neutral-500"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        className="w-60"
        sideOffset={10}
      >
        <div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
          <CustomAvatar
            src=""
            alt={avatarFallback}
            className="size-[52px] border border-neutral-300 transition hover:opacity-75 dark:border-purple-300"
            fallbackClassName="bg-neutral-200 dark:bg-purple-900/40 text-xl font-medium text-neutral-500"
          />
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {user.name || "User"}
            </p>
            <p className="text-xs text-neutral-500">{user.email}</p>
          </div>
        </div>
        <DottedSeparator className="mb-1" />
        <DropdownMenuItem className="flex h-10 cursor-pointer items-center justify-center font-medium text-blue-700">
          <Link href={"/dashboard"} className="flex items-center">
            <LayoutDashboard className="mr-2 size-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DottedSeparator className="my-1" />

        <DropdownMenuItem
          onClick={() => logout()}
          className="flex h-10 cursor-pointer items-center justify-center font-medium text-amber-700"
        >
          <LogOut className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
