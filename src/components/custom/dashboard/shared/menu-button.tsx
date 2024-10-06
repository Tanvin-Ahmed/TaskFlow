"use client";
import { Button } from "../../../ui/button";
import { Menu } from "lucide-react";
import useSidebar from "@/hooks/use-sidebar";

const MenuButton = () => {
  const { handleOpenSidebar, handleCloseSidebar, openSidebar } = useSidebar();

  const handleClick = () => {
    if (openSidebar) {
      handleCloseSidebar();
    } else {
      handleOpenSidebar();
    }
  };

  return (
    <Button
      size={"icon"}
      className="inline-block p-2 sm:hidden"
      onClick={handleClick}
    >
      <Menu />
    </Button>
  );
};

export default MenuButton;
