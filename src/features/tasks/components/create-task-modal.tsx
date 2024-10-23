"use client";
import ResponsiveModal from "@/components/custom/dashboard/responsive-modal";
import useCreateTaskModal from "../hooks/use-create-task-modal";
import CreateTaskFormWrapper from "./create-task-form-wrapper";
import { TaskStatus } from "../types";

const CreateTaskModal = () => {
  const { isOpen, setIsOpen, close, status } = useCreateTaskModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateTaskFormWrapper onCancel={close} status={status as TaskStatus} />
    </ResponsiveModal>
  );
};

export default CreateTaskModal;
