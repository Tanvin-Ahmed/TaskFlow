"use client";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../../shared/theme-button";
import UserButton from "@/features/auth/components/user-button";
import { usePathname } from "next/navigation";
import MobileSidebar from "../../shared/sidebar/mobile-sidebar";
import { Models } from "node-appwrite";
import Notification from "@/features/notifications/components/notification";

const pageNameMap = {
  tasks: {
    title: "My Tasks",
    description: "View all of your tasks here",
  },
  projects: {
    title: "My Projects",
    description: "View all of your projects here",
  },
};

const defaultMap = {
  title: "Dashboard",
  description: "Monitor all of your projects and tasks here.",
};

interface Props {
  user: Models.User<Models.Preferences>;
}

const DashboardNavbar = ({ user }: Props) => {
  const pathname = usePathname();
  const pathnameParts = pathname.split("/");
  const pathnameKey = pathnameParts[4] as keyof typeof pageNameMap;
  const { description, title } = pageNameMap[pathnameKey] || defaultMap;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-sm dark:bg-indigo-900/20">
      <nav
        className={cn(
          "container mx-auto flex items-center justify-between p-2",
        )}
      >
        <MobileSidebar user={user} />
        <div className="hidden flex-col lg:flex">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <UserButton />
          <Notification />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default DashboardNavbar;
