"use client";
import ResponsiveModal from "@/components/custom/dashboard/responsive-modal";
import useProjectId from "@/features/projects/hooks/use-project-id";
import useShareDocModal from "../hooks/use-share-doc-modal";
import { useSelf } from "@liveblocks/react/suspense";
import { UserType } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import Select, { StylesConfig } from "react-select";
import makeAnimated from "react-select/animated";
import useGetAssignees from "@/features/projects/api/use-get-assignees";
import { LoaderIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import Collaborator from "./collaborator";
import DottedSeparator from "@/components/custom/shared/dotted-separator";
import UserTypeSelector from "./user-type-selector";
import { updateDocAccessSchema } from "../schema";
import { useUpdateDoc } from "../api/use-update-doc";

const animatedComponents = makeAnimated();

const colorStyles: StylesConfig = {
  option: (styles, { isDisabled, isFocused, isSelected }) => ({
    ...styles,
    backgroundColor: isDisabled
      ? undefined
      : isSelected
        ? "#12213B"
        : isFocused
          ? "#12213B"
          : undefined,
    ":active": {
      ...styles[":active"],
      backgroundColor: !isDisabled
        ? isSelected
          ? "#12213B"
          : "#0B1527"
        : undefined,
    },
  }),
  multiValue: (styles) => {
    return {
      ...styles,
      backgroundColor: "#12213B",
    };
  },
  multiValueLabel: (styles) => ({
    ...styles,
    color: "#fff",
  }),
};

interface Props {
  creatorId: string;
  currentUserType: UserType;
  collaborators: ({
    userType: UserType;
    id: string;
    name: string;
    email: string;
    color: string;
  } | null)[];
}

const ShareModal = ({ collaborators, creatorId }: Props) => {
  const { resolvedTheme } = useTheme();
  const roomId = useProjectId();
  const { isOpen, setIsOpen } = useShareDocModal();
  const { data: assigneesInfo, isLoading: isLoadingAssigneesInfo } =
    useGetAssignees({ projectId: roomId });
  const { mutate, isPending } = useUpdateDoc();

  const user = useSelf();

  const form = useForm<z.infer<typeof updateDocAccessSchema>>({
    resolver: zodResolver(updateDocAccessSchema),
    defaultValues: {
      emails: [],
      userType: "viewer",
      updatedBy: user.info.email,
    },
  });

  const onSubmit = (values: z.infer<typeof updateDocAccessSchema>) => {
    mutate({
      json: values,
      param: { roomId },
    });
    form.reset();
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">
            Manage who can access this documentation
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Select which team member can access this document
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingAssigneesInfo ? (
            <div className="flex flex-col items-center justify-center">
              <LoaderIcon className="size-4 animate-spin text-muted-foreground" />
              <small className="inline-block text-xs text-muted-foreground">
                Getting team members...
              </small>
            </div>
          ) : (
            <>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="emails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Members</FormLabel>
                        <FormControl>
                          <Select
                            {...field}
                            closeMenuOnSelect={false}
                            components={animatedComponents}
                            isMulti // To allow multiple selections
                            value={field.value.map((email: string) => ({
                              label:
                                assigneesInfo?.find(
                                  (user) => user.email === email,
                                )?.name || email,
                              value: email,
                            }))} // Map the emails to { label, value } format
                            onChange={(selectedOptions) => {
                              const selectedEmails = (
                                selectedOptions as { value: string }[]
                              ).map(
                                (option: { value: string }) => option.value,
                              );
                              field.onChange(selectedEmails); // Update form state with selected emails
                            }}
                            options={
                              assigneesInfo?.map((user) => ({
                                label: user.name,
                                value: user.email,
                              })) || []
                            } // Use email as both label and value
                            styles={
                              resolvedTheme === "dark" ? colorStyles : undefined
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type of access</FormLabel>
                        <FormControl>
                          <UserTypeSelector
                            userType={field.value}
                            setUserType={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <div className="flex items-center justify-center gap-1">
                        <LoaderIcon className="size-3 animate-spin text-muted-foreground" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      "Give access"
                    )}
                  </Button>
                </form>
              </Form>

              <DottedSeparator className="my-4" />

              <div className="space-y-2">
                {collaborators.map((collaborator) =>
                  collaborator ? (
                    <Collaborator
                      key={collaborator.id}
                      collaborator={collaborator}
                      roomId={roomId}
                      user={user.info}
                      creatorId={creatorId}
                    />
                  ) : null,
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </ResponsiveModal>
  );
};

export default ShareModal;
