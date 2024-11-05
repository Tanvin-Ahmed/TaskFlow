"use client";

import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { TaskStatus } from "../types";

const useCreateTaskModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-task",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true }),
  );

  const [status, setStatus] = useQueryState(
    "fixed-status",
    parseAsString.withDefault("").withOptions({}),
  );

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const setStatusTo = (newStatus: TaskStatus | null) => {
    setStatus(newStatus);
  };

  return { isOpen, setIsOpen, open, close, status, setStatusTo };
};

export default useCreateTaskModal;
