"use client";
import { setOpenFullSidebar, setOpenSidebar } from "@/redux";
import { useAppDispatch, useAppSelector } from "@/redux/store";

const useSidebar = () => {
  const dispatch = useAppDispatch();
  const { openFullSidebar, openSidebar } = useAppSelector(
    (state) => state.global,
  );

  const handleOpenSidebar = () => dispatch(setOpenSidebar(true));
  const handleCloseSidebar = () => dispatch(setOpenSidebar(false));

  const toggleOpenFullSidebar = () => {
    dispatch(setOpenFullSidebar(!openFullSidebar));
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
