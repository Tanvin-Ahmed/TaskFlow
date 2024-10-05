"use client";
import { AppContext } from "@/context/app-context";
import { useContext } from "react";

const useSidebar = () => {
  const { openSidebar, setOpenSidebar, openFullSidebar, setOpenFullSidebar } =
    useContext(AppContext);

  const handleOpenSidebar = () => setOpenSidebar(true);
  const handleCloseSidebar = () => setOpenSidebar(false);

  const toggleOpenFullSidebar = () => {
    setOpenFullSidebar((state) => !state);
  };

  return {
    openSidebar,
    handleOpenSidebar,
    handleCloseSidebar,
    openFullSidebar,
    toggleOpenFullSidebar,
  };
};

export default useSidebar;
