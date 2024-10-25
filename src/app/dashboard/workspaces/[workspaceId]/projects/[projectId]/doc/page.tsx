import { getCurrent } from "@/features/auth/server/queries";
import { redirect } from "next/navigation";
import DocClient from "./client";

const DocPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <section>
      <DocClient />
    </section>
  );
};

export default DocPage;
