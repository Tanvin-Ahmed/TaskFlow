import SignUpCard from "@/features/auth/components/sign-up-card";
import { getCurrent } from "@/features/auth/server/queries";
import { redirect } from "next/navigation";

const page = async () => {
  const user = await getCurrent();

  if (user) redirect("/dashboard");

  return (
    <div className="flex w-full items-center justify-center">
      <SignUpCard />
    </div>
  );
};

export default page;
