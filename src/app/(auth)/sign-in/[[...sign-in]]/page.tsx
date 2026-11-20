import { SignIn } from "@clerk/nextjs";
import { getCurrent } from "@/features/auth/server/queries";
import { redirect } from "next/navigation";

interface Props {
  searchParams: {
    callbackUrl?: string;
  };
}

const SignInPage = async ({ searchParams }: Props) => {
  const user = await getCurrent();
  const callbackUrl =
    searchParams.callbackUrl?.startsWith("/") &&
    !searchParams.callbackUrl.startsWith("//")
      ? searchParams.callbackUrl
      : "/dashboard";

  if (user) redirect(callbackUrl);

  return (
    <div className="flex w-full items-center justify-center py-8">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl={
          callbackUrl !== "/dashboard"
            ? `/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`
            : "/sign-up"
        }
        forceRedirectUrl={callbackUrl}
        fallbackRedirectUrl={callbackUrl}
      />
    </div>
  );
};

export default SignInPage;
