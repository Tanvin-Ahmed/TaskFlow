import SignUpCard from "@/features/auth/components/sign-up-card";
import { getCurrent } from "@/features/auth/server/queries";
import { redirect } from "next/navigation";

interface Props {
  searchParams: {
    callbackUrl?: string;
  };
}

const page = async ({ searchParams }: Props) => {
  const user = await getCurrent();
  const callbackUrl =
    searchParams.callbackUrl?.startsWith("/") &&
    !searchParams.callbackUrl.startsWith("//")
      ? searchParams.callbackUrl
      : "/dashboard";

  if (user) redirect(callbackUrl);

  return (
    <div className="flex w-full items-center justify-center">
      <SignUpCard callbackUrl={callbackUrl} />
    </div>
  );
};

export default page;
