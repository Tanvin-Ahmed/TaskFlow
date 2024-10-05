"use client";
import React, { useState, createContext } from "react";

type Props = {
  children: React.ReactNode;
};

type AppContextType = {
  openSidebar: boolean;
  setOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  openFullSidebar: boolean;
  setOpenFullSidebar: React.Dispatch<React.SetStateAction<boolean>>;
};

const appContextDefaultValues: AppContextType = {
  openSidebar: false,
  setOpenSidebar: () => {},
  openFullSidebar: false,
  setOpenFullSidebar: () => {},
};

export const AppContext = createContext<AppContextType>(
  appContextDefaultValues,
);

const AppContextProvider = ({ children }: Props) => {
  const [openSidebar, setOpenSidebar] = useState<boolean>(false);
  const [openFullSidebar, setOpenFullSidebar] = useState<boolean>(true);

  return (
    <AppContext.Provider
      value={{
        openSidebar,
        setOpenSidebar,
        openFullSidebar,
        setOpenFullSidebar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
