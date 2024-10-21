"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateWorkspaceSchema } from "../schema";
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
import { ArrowLeftIcon, CopyIcon, ImageIcon, Loader } from "lucide-react";
import { ChangeEvent, useRef } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Workspace } from "../types";
import { useUpdateWorkspace } from "../api/use-update-workspace";
import useConfirm from "@/hooks/use-confirm";
import { useDeleteWorkspace } from "../api/use-delete-workspace";
import { toast } from "sonner";
import { useResetInviteCode } from "../api/use-reset-invite-code";

interface Props {
  onCancel?: () => void;
  initialValue: Workspace;
}

const UpdateWorkspaceForm = ({ onCancel, initialValue }: Props) => {
  const router = useRouter();
  const { confirm, ConfirmationDialog } = useConfirm(
    "Delete Workspace",
    "This action cannot be undone.",
    "destructive",
  );
  const { confirm: confirmReset, ConfirmationDialog: ConfirmationResetDialog } =
    useConfirm(
      "Reset invite link",
      "This will invalidate the current invite link.",
      "destructive",
    );
  const { mutate: deleteWorkspace, isPending: isDeletingWorkspace } =
    useDeleteWorkspace();
  const { mutate: resetInviteCode, isPending: isResetIngInviteCode } =
    useResetInviteCode();
  const { mutate, isPending } = useUpdateWorkspace();

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
    resolver: zodResolver(updateWorkspaceSchema),
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

    deleteWorkspace(
      { param: { workspaceId: initialValue.$id } },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
      },
    );
  };

  const onSubmit = (values: z.infer<typeof updateWorkspaceSchema>) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : "",
    };

    mutate({ form: finalValues, param: { workspaceId: initialValue.$id } });
  };

  const fullInviteLink = `${window.location.origin}/workspaces/${initialValue.$id}/join/${initialValue.inviteCode}`;

  const handleCopyInviteLink = () => {
    navigator.clipboard
      .writeText(fullInviteLink)
      .then(() => toast.success("Invite link copied to clipboard"));
  };

  const handleResetInviteCode = async () => {
    const ok = await confirmReset();
    if (!ok) {
      return;
    }

    resetInviteCode({ param: { workspaceId: initialValue.$id } });
  };

  return (
    <div className="flex flex-col gap-y-4">
      <ConfirmationDialog /> {/*open confirmation modal before delete*/}
      <ConfirmationResetDialog />{" "}
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
                : () => router.push(`/dashboard/workspaces/${initialValue.$id}`)
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
                      <FormLabel>Workspace name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a workspace name"
                          {...field}
                        />
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
                          <p className="text-sm">Workspace Icon</p>
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
                  disabled={isPending || isDeletingWorkspace}
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
      {/* reset invite code */}
      <Card className="h-full w-full border-none bg-neutral-50 shadow-none dark:bg-purple-900/5">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Invite members</h3>
            <p className="text-sm text-muted-foreground">
              Use the invite link to add members to your workspace.
            </p>
            <div className="mt-4">
              <div className="flex items-center">
                <Input
                  disabled
                  value={fullInviteLink}
                  className={"rounded-r-none border-r-0"}
                />
                <Button
                  onClick={handleCopyInviteLink}
                  variant={"muted"}
                  className={"rounded-l-none"}
                >
                  <CopyIcon className={"size-4"} />
                </Button>
              </div>
            </div>
            <DottedSeparator className={"py-7"} />
            <Button
              className="ml-auto mt-6 w-fit"
              size={"sm"}
              type="button"
              disabled={isResetIngInviteCode || isPending}
              onClick={handleResetInviteCode}
            >
              {isResetIngInviteCode ? (
                <Loader className="size-7 animate-spin" />
              ) : (
                "Reset invite link"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* delete workspace */}
      <Card className="h-full w-full border-none bg-neutral-50 shadow-none dark:bg-purple-900/5">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              Deleting a workspace is irreversible and will remove all
              associated data.
            </p>
            <DottedSeparator className={"py-7"} />
            <Button
              className="ml-auto mt-6 w-fit"
              size={"sm"}
              variant={"destructive"}
              type="button"
              disabled={isDeletingWorkspace || isPending}
              onClick={handleDelete}
            >
              {isDeletingWorkspace ? (
                <Loader className="size-7 animate-spin" />
              ) : (
                "Delete Workspace"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateWorkspaceForm;
