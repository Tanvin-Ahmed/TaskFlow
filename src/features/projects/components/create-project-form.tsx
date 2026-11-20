"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createProjectSchema } from "../schema";
import { z } from "zod";
import { useCreateProject } from "../api/use-create-project";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DottedSeparator from "@/components/custom/shared/dotted-separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import useWorkspaceId from "@/features/workspaces/hooks/use-workspace-id";
import { useRouter } from "next/navigation";

interface Props {
  onCancel?: () => void;
}

const CreateProjectForm = ({ onCancel }: Props) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { mutate, isPending } = useCreateProject();

  const form = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      workspaceId,
    },
  });

  const onSubmit = (values: z.infer<typeof createProjectSchema>) => {
    mutate(
      {
        form: {
          ...values,
          workspaceId,
        },
      },
      {
        onSuccess: ({ data }) => {
          form.reset();
          onCancel?.();
          router.push(
            `/dashboard/workspaces/${workspaceId}/projects/${data.$id}`,
          );
        },
      },
    );
  };

  return (
    <Card className="h-full w-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">
          Create a new project
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DottedSeparator className="py-7" />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Button
                disabled={isPending}
                type="button"
                size={"lg"}
                variant={"secondary"}
                onClick={onCancel}
                className={cn("invisible w-full sm:w-fit", {
                  visible: onCancel,
                })}
              >
                Cancel
              </Button>
              <Button
                disabled={isPending}
                type="submit"
                size={"lg"}
                className="w-full sm:w-fit"
              >
                {isPending ? (
                  <Loader className="size-7 animate-spin" />
                ) : (
                  "Create project"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateProjectForm;
