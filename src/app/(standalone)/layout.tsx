import CustomAvatar from "@/components/custom/shared/custom-avatar";
import { ThemeToggle } from "@/components/custom/shared/theme-button";
import UserButton from "@/features/auth/components/user-button";
import Link from "next/link";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const StandaloneLayout = ({ children }: Props) => {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-screen-2xl p-4">
        <nav className="sticky top-0 flex h-[73px] items-center justify-between backdrop-blur-sm dark:bg-transparent">
          <Link href={"/"} className="flex items-center gap-2">
            <CustomAvatar src="/assets/icons/logo.png" alt="TF" />
            <h1 className="text-xl font-bold sm:text-2xl">
              <span className="text-primary">Task</span> Flow
            </h1>
          </Link>
          <div className="flex items-center justify-center gap-3">
            <UserButton />
            <ThemeToggle />
          </div>
        </nav>
        <div className="flex flex-col items-center justify-center py-4">
          {children}
        </div>
      </div>
    </main>
  );
};

export default StandaloneLayout;
