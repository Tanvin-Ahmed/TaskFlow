"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateProjectSchema } from "../schema";
import { z } from "zod";
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
import { ArrowLeftIcon, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { Project } from "../types";
import useConfirm from "@/hooks/use-confirm";
import { useDeleteProject } from "../api/use-delete-project";
import { useUpdateProject } from "../api/use-update-project";

interface Props {
  onCancel?: () => void;
  initialValue: Project;
}

const UpdateProjectForm = ({ onCancel, initialValue }: Props) => {
  const router = useRouter();
  const { confirm, ConfirmationDialog } = useConfirm(
    "Delete Project",
    "This action cannot be undone.",
    "destructive",
  );

  const { mutate: deleteProject, isPending: isDeletingProject } =
    useDeleteProject();
  const { mutate, isPending } = useUpdateProject();

  const form = useForm<z.infer<typeof updateProjectSchema>>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: initialValue.name,
    },
  });

  const handleDelete = async () => {
    const ok = await confirm();
    if (!ok) {
      return;
    }

    deleteProject(
      { param: { projectId: initialValue.$id } },
      {
        onSuccess: () => {
          router.push(`/dashboard/workspaces/${initialValue.workspaceId}`);
        },
      },
    );
  };

  const onSubmit = (values: z.infer<typeof updateProjectSchema>) => {
    mutate(
      {
        form: values,
        param: { projectId: initialValue.$id },
      },
      {
        onSuccess: ({ data }) => {
          router.push(
            `/dashboard/workspaces/${initialValue.workspaceId}/projects/${data.$id}`,
          );
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-y-4">
      <ConfirmationDialog />
      <Card className="h-full w-full border-none bg-neutral-50 shadow-none dark:bg-purple-900/5">
        <CardHeader className="flex flex-row items-center gap-x-4 space-y-0 p-7">
          <Button
            size={"icon"}
            variant={"secondary"}
            onClick={
              onCancel
                ? onCancel
                : () =>
                    router.push(
                      `/dashboard/workspaces/${initialValue.workspaceId}/projects/${initialValue.$id}`,
                    )
            }
            className="flex items-center justify-center rounded-full"
          >
            <ArrowLeftIcon className={"size-4"} />
          </Button>
          <CardTitle className="text-xl font-bold">
            {initialValue.name}
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
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DottedSeparator className="py-7" />
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Button
                  disabled={isPending || isDeletingProject}
                  type="submit"
                  size={"lg"}
                  className="w-full sm:w-fit"
                >
                  {isPending ? (
                    <Loader className="size-7 animate-spin" />
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card className="h-full w-full border-none bg-neutral-50 shadow-none dark:bg-purple-900/5">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              Deleting a project is irreversible and will remove all associated
              data.
            </p>
            <DottedSeparator className={"py-7"} />
            <Button
              className="ml-auto mt-6 w-fit"
              size={"sm"}
              variant={"destructive"}
              type="button"
              disabled={isDeletingProject || isPending}
              onClick={handleDelete}
            >
              {isDeletingProject ? (
                <Loader className="size-7 animate-spin" />
              ) : (
                "Delete Project"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateProjectForm;
