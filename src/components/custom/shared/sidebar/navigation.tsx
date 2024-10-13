import { cn } from "@/lib/utils";
import { MdOutlineDashboard, MdDashboard } from "react-icons/md";
import { Settings, UsersIcon } from "lucide-react";
import Link from "next/link";
import { GoCheckCircle, GoCheckCircleFill } from "react-icons/go";

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

const Navigation = () => {
  return (
    <ul className="flex flex-col">
      {routes.map((route) => {
        const isActive = false;
        const Icon = isActive ? route.activeIcon : route.icon;

        return (
          <Link key={route.label} href={route.href}>
            <div
              className={cn(
                "flex items-center gap-2.5 rounded-md p-2.5 font-medium text-neutral-500 transition hover:text-primary",
                {
                  "bg-white text-primary shadow-sm hover:opacity-100": isActive,
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
