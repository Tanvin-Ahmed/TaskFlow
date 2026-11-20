import CustomAvatar from "@/components/custom/shared/custom-avatar";
import { ThemeToggle } from "@/components/custom/shared/theme-button";
import UserButton from "@/features/auth/components/user-button";
import Notification from "@/features/notifications/components/notification";
import { getCurrent } from "@/features/auth/server/queries";
import Link from "next/link";
import { ReactNode, Suspense } from "react";

interface Props {
  children: ReactNode;
}

const StandaloneLayout = async ({ children }: Props) => {
  const user = await getCurrent();

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
          <div className="flex items-center justify-center gap-2">
            {user ? (
              <>
                <UserButton />
                <Suspense fallback={null}>
                  <Notification />
                </Suspense>
              </>
            ) : null}
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
