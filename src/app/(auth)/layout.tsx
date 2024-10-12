import Navbar from "@/components/custom/shared/navbar";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const layout = ({ children }: Props) => {
  return (
    <main className="max-h-full min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-screen-2xl p-4">
        <div className="flex h-full w-full flex-col items-center justify-center pt-4 md:pt-14">
          {children}
        </div>
      </div>
    </main>
  );
};

export default layout;
