import { SignUp } from "@clerk/nextjs";
import { getCurrent } from "@/features/auth/server/queries";
import { redirect } from "next/navigation";

interface Props {
  searchParams: {
    callbackUrl?: string;
  };
}

const SignUpPage = async ({ searchParams }: Props) => {
  const user = await getCurrent();
  const callbackUrl =
    searchParams.callbackUrl?.startsWith("/") &&
    !searchParams.callbackUrl.startsWith("//")
      ? searchParams.callbackUrl
      : "/dashboard";

  if (user) redirect(callbackUrl);

  return (
    <div className="flex w-full items-center justify-center py-8">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl={
          callbackUrl !== "/dashboard"
            ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`
            : "/sign-in"
        }
        forceRedirectUrl={callbackUrl}
        fallbackRedirectUrl={callbackUrl}
      />
    </div>
  );
};

export default SignUpPage;
