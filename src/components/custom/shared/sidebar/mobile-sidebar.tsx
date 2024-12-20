"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import Sidebar from "./sidebar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Models } from "node-appwrite";

interface Props {
  user: Models.User<Models.Preferences>;
}

const MobileSidebar = ({ user }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Sheet modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant={"secondary"} className="lg:hidden">
          <MenuIcon className="size-5 text-neutral-500 dark:text-primary-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <Sidebar user={user} />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
