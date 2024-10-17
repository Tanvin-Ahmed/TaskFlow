"use client";
import ResponsiveModal from "@/components/custom/dashboard/responsive-modal";
import useUpdateTaskModal from "../hooks/use-update-task-modal";
import UpdateTaskFormWrapper from "./update-task-form-wrapper";

const UpdateTaskModal = () => {
  const { taskId, close } = useUpdateTaskModal();

  return (
    <ResponsiveModal open={!!taskId} onOpenChange={close}>
      {!!taskId ? <UpdateTaskFormWrapper onCancel={close} id={taskId} /> : null}
    </ResponsiveModal>
  );
};

export default UpdateTaskModal;
