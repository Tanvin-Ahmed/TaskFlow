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
import { ArrowLeftIcon, ImageIcon, Loader } from "lucide-react";
import { ChangeEvent, useRef } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof updateProjectSchema>>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      ...initialValue,
      image: initialValue.imageUrl ?? "",
    },
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      form.setValue("image", file);
    }
  };

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
        form: {
          ...values,
          image: values.image instanceof File ? values.image : "",
        },
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
      <ConfirmationDialog /> {/*open confirmation modal before delete*/}
      {/*open confirmation modal before reset invitation code */}
      {/* update workspace */}
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
              <div className="flex flex-col gap-y-4">
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
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <div className="flex flex-col gap-y-2">
                      <div className="flex items-center gap-x-5">
                        {field.value ? (
                          <div className="relative size-[72px] overflow-hidden rounded-md">
                            <Image
                              alt="selected img"
                              src={
                                field.value instanceof File
                                  ? URL.createObjectURL(field.value)
                                  : field.value
                              }
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <Avatar className="size-[72px]">
                            <AvatarFallback>
                              <ImageIcon className="size-[36px] text-neutral-400" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex flex-col">
                          <p className="text-sm">Project Icon</p>
                          <p className="text-sm text-muted-foreground">
                            JPG, PNG, SVG or JPEG, max 1MB
                          </p>
                          <input
                            type="file"
                            className="hidden"
                            accept=".jpg, .png, .jpeg, .svg"
                            ref={inputRef}
                            disabled={isPending}
                            onChange={handleImageChange}
                          />
                          <Button
                            type="button"
                            disabled={isPending}
                            variant={"teritary"}
                            size={"xs"}
                            className="mt-2 w-fit"
                            onClick={() => inputRef.current?.click()}
                          >
                            Upload Image
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                />
              </div>
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
      {/* delete workspace */}
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
