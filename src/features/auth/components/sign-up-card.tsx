"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import DottedSeparator from "../../../components/custom/shared/dotted-separator";
import Link from "next/link";
import { signUpSchema } from "@/features/auth/schema";
import { useSignUp } from "../api/use-signup";
import { Loader } from "lucide-react";
import { signUpWithGithub, signUpWithGoogle } from "@/lib/oauth";

const SignUpCard = () => {
  const { mutate, isPending } = useSignUp();
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof signUpSchema>) => {
    mutate({ json: values });
  };

  return (
    <Card className="w-full border-none shadow-md md:w-[487px]">
      <CardHeader className="flex items-center justify-center p-7 text-center">
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>
          By signing up, you agree to our{" "}
          <Link href={"/privacy"}>
            <span className="text-blue-700">Privacy Policy</span>
          </Link>{" "}
          and{" "}
          <Link href={"/terms"}>
            <span className="text-blue-700">Terms of Service</span>
          </Link>
        </CardDescription>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
        <CardContent className="p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isPending} type="submit" className="w-full">
                {isPending ? (
                  <Loader className="size-7 animate-spin" />
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <div className="px-7">
          <DottedSeparator />
        </div>
        <CardContent className="flex flex-col gap-y-4 p-7">
          <Button
            disabled={false}
            variant={"secondary"}
            size={"lg"}
            className="w-full"
            onClick={() => signUpWithGoogle()}
          >
            <FcGoogle className="mr-2 size-5" />
            Login with Google
          </Button>
          <Button
            disabled={false}
            variant={"outline"}
            size={"lg"}
            className="w-full"
            onClick={() => signUpWithGithub()}
          >
            <FaGithub className="mr-2 size-5" />
            Login with Github
          </Button>
        </CardContent>
        <div className="px-7">
          <DottedSeparator />
        </div>
        <CardContent className={"flex items-center justify-center p-7"}>
          <small>
            Already have an account?{" "}
            <Link href={"/sign-in"}>
              <span className="text-blue-700">&nbsp;Sign In</span>
            </Link>
          </small>
        </CardContent>
      </div>
    </Card>
  );
};

export default SignUpCard;
