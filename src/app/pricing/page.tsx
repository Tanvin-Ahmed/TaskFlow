import { getCurrent } from "@/features/auth/server/queries";
import Pricing from "@/features/pricing/components/pricing";
import { redirect } from "next/navigation";

const PricingPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <section className="container mx-auto p-4">
      <Pricing />
    </section>
  );
};

export default PricingPage;
