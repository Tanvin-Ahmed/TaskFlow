"use client";
import { cn } from "@/lib/utils";
import { MdOutlineDashboard, MdDashboard } from "react-icons/md";
import { Settings, UsersIcon, LoaderIcon } from "lucide-react";
import Link from "next/link";
import { GoCheckCircle, GoCheckCircleFill } from "react-icons/go";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";
import { usePathname } from "next/navigation";
import { Models } from "node-appwrite";
import { useGetUserIsAdmin } from "@/features/workspaces/api/use-get-user-isAdmin";

const routes = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: MdOutlineDashboard,
    activeIcon: MdDashboard,
  },
  {
    label: "My Tasks",
    href: "/tasks",
    icon: GoCheckCircle,
    activeIcon: GoCheckCircleFill,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    activeIcon: Settings,
  },
  {
    label: "Members",
    href: "/members",
    icon: UsersIcon,
    activeIcon: UsersIcon,
  },
];

interface Props {
  user: Models.User<Models.Preferences>;
}

const Navigation = ({ user }: Props) => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();
  const { data: isAdmin, isLoading: isLoadingIsAdmin } = useGetUserIsAdmin({
    workspaceId,
    userId: user.$id,
  });

  return isLoadingIsAdmin ? (
    <div className="flex items-center justify-center">
      <LoaderIcon className={"size-4 animate-spin text-muted-foreground"} />
    </div>
  ) : (
    <ul className="flex flex-col">
      {routes
        .filter((route) => (isAdmin ? route : route.href !== "/settings"))
        .map((route) => {
          let fullHref;
          if (route.href === "/tasks") {
            fullHref = `/dashboard/workspaces/${workspaceId}${route.href}`;
          } else if (route.href === "/dashboard") {
            fullHref = `${route.href}/workspaces/${workspaceId}`;
          } else {
            fullHref = `/workspaces/${workspaceId}${route.href}`;
          }
          const isActive = pathname === fullHref;
          const Icon = isActive ? route.activeIcon : route.icon;

          return (
            <Link key={route.href} href={fullHref}>
              <div
                className={cn(
                  "flex items-center gap-2.5 rounded-md p-2.5 font-medium text-neutral-500 transition hover:text-primary",
                  {
                    "border bg-white text-primary shadow-sm hover:opacity-100 dark:bg-muted":
                      isActive,
                  },
                )}
              >
                <Icon className="size-5" />
                {route.label}
              </div>
            </Link>
          );
        })}
    </ul>
  );
};

export default Navigation;
