import { parseAsBoolean, useQueryState } from "nuqs";

const useShareDocModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "share-doc",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true }),
  );

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return { isOpen, setIsOpen, open, close };
};

export default useShareDocModal;
