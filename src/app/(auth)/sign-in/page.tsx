import SignInCard from "@/features/auth/components/sign-in-card";
import { getCurrent } from "@/features/auth/server/action";
import { redirect } from "next/navigation";

const SignInPage = async () => {
  const user = await getCurrent();

  if (user) redirect("/dashboard");

  return (
    <div className="flex w-full items-center justify-center">
      <SignInCard />
    </div>
  );
};

export default SignInPage;
