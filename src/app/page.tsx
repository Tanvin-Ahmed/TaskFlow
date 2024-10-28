import Services from "@/components/custom/home/services";
import HeroText from "@/components/custom/home/hero-text";
import BgGrid from "@/components/custom/shared/bg-grid";
import Footer from "@/components/custom/shared/footer";
import Navbar from "@/components/custom/shared/navbar";
import { createUserPaymentStatusInBD } from "@/features/auth/server/queries";

export default async function Home() {
  await createUserPaymentStatusInBD();

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-h-[100%] min-h-[100vh] w-full space-y-20 px-4">
        <BgGrid />
        {/* <div className="mt-20 -mb-24 hidden dark:block">
          <Planet />
        </div> */}
        <HeroText />
        <Services />
      </main>
      <Footer />
    </>
  );
}
